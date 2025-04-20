# test-api.py

import asyncio
import json
import requests
import websockets
import time
from pprint import pprint
from datetime import datetime

API_URL = "http://localhost:8000"
WS_URL = "ws://localhost:8000/ws"

# Test the health endpoint
async def test_health():
    print("\n--- Testing GET /health endpoint ---")
    try:
        response = requests.get(f"{API_URL}/health")
        print(f"Response status: {response.status_code}")
        print(f"Response JSON: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error testing health endpoint: {e}")
        return False

# Test the POST /start-job endpoint
async def test_start_job():
    print("\n--- Testing POST /start-job endpoint ---")
    try:
        response = requests.post(f"{API_URL}/start-job")
        print(f"Response status: {response.status_code}")
        print(f"Response JSON: {response.json()}")
        return response.json().get('job_id')
    except Exception as e:
        print(f"Error testing start_job: {e}")
        return None

# Test the WebSocket connection
async def test_websocket(job_id):
    print("\n--- Testing WebSocket connection ---")
    message_count = 0
    status_counts = {
        "connected": 0,
        "action_started": 0,
        "action_completed": 0,
        "action_error": 0,
        "monitoring_started": 0,
        "agent_status": 0,
        "file_uploaded": 0,
        "started": 0,
        "completed": 0,
        "failed": 0
    }
    
    try:
        async with websockets.connect(WS_URL) as websocket:
            print("WebSocket connection established")
            
            # Wait for messages related to the job
            max_wait_time = 120  # seconds
            start_time = time.time()
            
            print(f"Waiting for messages related to job {job_id}...")
            print("\nStreaming agent actions (press Ctrl+C to exit early):")
            print("-" * 60)
            
            try:
                while time.time() - start_time < max_wait_time:
                    try:
                        # Set a timeout for receiving messages
                        message = await asyncio.wait_for(websocket.recv(), timeout=2.0)
                        message_data = json.loads(message)
                        message_count += 1
                        
                        # Track status types
                        status = message_data.get('status')
                        if status in status_counts:
                            status_counts[status] += 1
                        
                        # Format timestamp if present
                        timestamp_str = ""
                        if 'timestamp' in message_data:
                            timestamp = message_data.get('timestamp')
                            try:
                                time_format = datetime.fromtimestamp(timestamp).strftime('%H:%M:%S')
                                timestamp_str = f"[{time_format}] "
                            except:
                                pass
                        
                        # Print formatted message based on type
                        if status == "connected":
                            print("✓ WebSocket connection confirmed")
                        elif status == "monitoring_started":
                            print(f"{timestamp_str}🔍 MONITORING STARTED: {message_data.get('message')}")
                        elif status == "agent_status":
                            url = message_data.get('current_url', 'Unknown URL')
                            print(f"{timestamp_str}🌐 AGENT AT: {url}")
                        elif status == "action_started":
                            print(f"\n{timestamp_str}→ ACTION STARTED: {message_data.get('action_name')}")
                        elif status == "action_completed":
                            print(f"{timestamp_str}✓ ACTION COMPLETED: {message_data.get('action_name')}")
                            if 'result' in message_data and message_data['result']:
                                print(f"  Result: {message_data.get('result')}")
                        elif status == "action_error":
                            print(f"{timestamp_str}❌ ACTION ERROR: {message_data.get('action_name')}")
                            print(f"  Error: {message_data.get('error')}")
                        elif status == "file_uploaded":
                            print(f"{timestamp_str}📁 FILE UPLOADED: {message_data.get('file_path')}")
                            print(f"  Message: {message_data.get('message')}")
                        elif status == "started":
                            print(f"\n{timestamp_str}▶ JOB STARTED: {message_data.get('job_id')}")
                            print(f"  Message: {message_data.get('message')}")
                        elif status == "completed":
                            print(f"\n{timestamp_str}✅ JOB COMPLETED: {message_data.get('job_id')}")
                            print(f"  Message: {message_data.get('message')}")
                            if job_id == message_data.get('job_id'):
                                print("\nJob completed successfully, exiting listener")
                                break
                        elif status == "failed":
                            print(f"\n{timestamp_str}❌ JOB FAILED: {message_data.get('job_id')}")
                            print(f"  Error: {message_data.get('error')}")
                            print(f"  Message: {message_data.get('message')}")
                            if job_id == message_data.get('job_id'):
                                break
                        else:
                            # For other unknown message types
                            print(f"\n{timestamp_str}OTHER MESSAGE TYPE: {status}")
                            print(f"  Content: {message_data}")
                        
                    except asyncio.TimeoutError:
                        # This is expected when there are no messages for a while
                        print(".", end="", flush=True)
                        pass
            except KeyboardInterrupt:
                print("\n\nListener stopped by user")
                
    except Exception as e:
        print(f"\nWebSocket error: {e}")
    
    print("\n" + "-" * 60)
    print(f"Received {message_count} total messages")
    print("\nMessage status counts:")
    for status, count in status_counts.items():
        if count > 0:
            print(f"  {status}: {count}")

# Run all tests
async def run_tests():
    # First check if the API is healthy
    if not await test_health():
        print("API health check failed. Make sure the API server is running.")
        return
    
    # Test the job start endpoint
    job_id = await test_start_job()
    
    if job_id:
        # Test the websocket to monitor the job
        await test_websocket(job_id)
    else:
        print("Skipping WebSocket test as no job ID was returned")

# Run the tests
if __name__ == "__main__":
    try:
        asyncio.run(run_tests())
    except KeyboardInterrupt:
        print("\nTests interrupted by user")
    except Exception as e:
        print(f"Error running tests: {e}")
