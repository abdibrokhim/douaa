import asyncio
import os
from fastapi import FastAPI, WebSocket
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from browser_use import Agent, Browser, Controller, BrowserConfig
from pathlib import Path
import json
import uuid
import time

load_dotenv()

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# instructions to list items on olx.uz
with open('list-items.md', 'r') as f:
    list_items = f.read()

# instructions to upload images to olx.uz
with open('upload-images.md', 'r') as f:
    upload_images = f.read()

# instructions to list items on olx.uz
with open('task.md', 'r') as f:
    task = f.read()

# Get absolute paths to images
image_dir = Path(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'images'))
available_image_paths = [str(image_dir / file) for file in os.listdir(image_dir) if file.endswith(('.jpg', '.jpeg', '.png'))]

# Store active WebSocket connections
active_connections = set()

# Create custom controller for monitoring actions
class MonitoredController(Controller):
    def __init__(self, job_id=None):
        super().__init__()
        self.job_id = job_id
        
    def register_action(self, name):
        original_action = super().register_action(name)
        
        def wrapper(func):
            async def monitored_action(*args, **kwargs):
                action_name = name
                
                # Broadcast action start
                await broadcast_message({
                    "job_id": self.job_id,
                    "status": "action_started",
                    "action_name": action_name,
                    "timestamp": time.time()
                })
                
                try:
                    # Call the original action
                    result = await func(*args, **kwargs)
                    
                    # Broadcast action complete
                    await broadcast_message({
                        "job_id": self.job_id,
                        "status": "action_completed",
                        "action_name": action_name,
                        "success": True,
                        "result": str(result) if result else None,
                        "timestamp": time.time()
                    })
                    
                    return result
                except Exception as e:
                    # Broadcast action error
                    error_message = str(e)
                    await broadcast_message({
                        "job_id": self.job_id,
                        "status": "action_error",
                        "action_name": action_name,
                        "error": error_message,
                        "timestamp": time.time()
                    })
                    raise
                    
            return original_action(monitored_action)
        return wrapper

# Create controller (will be assigned job_id later)
controller = MonitoredController()

@controller.action('Upload file to interactive element with file path ')
async def upload_file(index: int, path: str, browser, available_file_paths: list[str]):
    if path not in available_file_paths:
        error = {"error": f'File path {path} is not available'}
        await broadcast_message(error)
        return error

    if not os.path.exists(path):
        error = {"error": f'File {path} does not exist'}
        await broadcast_message(error)
        return error

    dom_el = await browser.get_dom_element_by_index(index)
    file_upload_dom_el = dom_el.get_file_upload_element()

    if file_upload_dom_el is None:
        error = {"error": f'No file upload element found at index {index}'}
        await broadcast_message(error)
        return error

    file_upload_el = await browser.get_locate_element(file_upload_dom_el)

    if file_upload_el is None:
        error = {"error": f'No file upload element found at index {index}'}
        await broadcast_message(error)
        return error

    try:
        await file_upload_el.set_input_files(path)
        result = {"extracted_content": f'Successfully uploaded file to index {index}', "include_in_memory": True}
        await broadcast_message({
            "job_id": controller.job_id,
            "status": "file_uploaded",
            "file_path": path,
            "message": f'Successfully uploaded file to index {index}'
        })
        return result
    except Exception as e:
        error = {"error": f'Failed to upload file to index {index}: {str(e)}'}
        await broadcast_message(error)
        return error

async def broadcast_message(message: dict):
    """Broadcast message to all connected WebSocket clients"""
    if active_connections:
        message_str = json.dumps(message)
        for connection in active_connections:
            try:
                await connection.send_text(message_str)
            except Exception as e:
                print(f"Error sending message to client: {e}")
                active_connections.discard(connection)

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_connections.add(websocket)
    try:
        # Send a connected confirmation message
        await websocket.send_text(json.dumps({"status": "connected"}))
        while True:
            # Keep connection alive, handle client messages if needed
            await websocket.receive_text()
    except Exception as e:
        print(f"WebSocket error: {e}")
        active_connections.discard(websocket)
    finally:
        active_connections.discard(websocket)

# Monitor agent's progress
async def monitor_agent_progress(job_id, agent, interval=2.0):
    """Periodically check agent's state and broadcast updates"""
    try:
        # Initial update
        await broadcast_message({
            "job_id": job_id,
            "status": "monitoring_started",
            "message": "Started monitoring agent progress"
        })
        
        while True:
            try:
                # Check if agent has browser
                if hasattr(agent, "browser") and agent.browser:
                    # Get current URL if available
                    try:
                        current_url = await agent.browser.get_url()
                        await broadcast_message({
                            "job_id": job_id,
                            "status": "agent_status",
                            "current_url": current_url,
                            "timestamp": time.time()
                        })
                    except:
                        pass
                
                # Sleep before next check
                await asyncio.sleep(interval)
            except Exception as e:
                print(f"Error in monitor loop: {e}")
                await asyncio.sleep(interval)
    except Exception as e:
        print(f"Monitor task error: {e}")

@app.post("/start-job")
async def start_job():
    job_id = str(uuid.uuid4())
    
    # Set job_id in the controller
    controller.job_id = job_id
    
    browser = Browser(
        config=BrowserConfig(
            headless=False,
        )
    )
    
    agent = Agent(
        task=task,
        llm=ChatOpenAI(
            model='gpt-4o',
            api_key=os.getenv('OPENAI_API_KEY'),
        ),
        browser=browser,
        controller=controller,
    )
    
    # Start monitoring task
    monitor_task = asyncio.create_task(monitor_agent_progress(job_id, agent))
    
    # Run agent in background
    async def run_job():
        try:
            await broadcast_message({
                "job_id": job_id, 
                "status": "started",
                "message": "Agent job started"
            })
            
            await agent.run()
            
            await broadcast_message({
                "job_id": job_id, 
                "status": "completed",
                "message": "Agent job completed successfully"
            })
        except Exception as e:
            error_message = str(e)
            print(f"Job error: {error_message}")
            await broadcast_message({
                "job_id": job_id, 
                "status": "failed", 
                "error": error_message,
                "message": "Agent job failed"
            })
        finally:
            # Cancel monitor task
            monitor_task.cancel()
            await browser.close()
    
    asyncio.create_task(run_job())
    return JSONResponse({
        "job_id": job_id, 
        "status": "started",
        "message": "Job started successfully"
    })

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)