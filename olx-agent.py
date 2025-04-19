from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from browser_use import Agent, Browser, Controller
import os
import asyncio
from pathlib import Path

load_dotenv()

# instructions to list items on olx.uz
with open('list-items.md', 'r') as f:
    task = f.read()

# instructions to upload images to olx.uz
with open('upload-images.md', 'r') as f:
    upload_images = f.read()

# Get absolute paths to images
image_dir = Path(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'images'))
available_image_paths = [str(image_dir / file) for file in os.listdir(image_dir) if file.endswith(('.jpg', '.jpeg', '.png'))]

# Create controller for file upload actions
controller = Controller()

@controller.action('Upload file to interactive element with file path ')
async def upload_file(index: int, path: str, browser, available_file_paths: list[str]):
    if path not in available_file_paths:
        return {"error": f'File path {path} is not available'}

    if not os.path.exists(path):
        return {"error": f'File {path} does not exist'}

    dom_el = await browser.get_dom_element_by_index(index)
    file_upload_dom_el = dom_el.get_file_upload_element()

    if file_upload_dom_el is None:
        return {"error": f'No file upload element found at index {index}'}

    file_upload_el = await browser.get_locate_element(file_upload_dom_el)

    if file_upload_el is None:
        return {"error": f'No file upload element found at index {index}'}

    try:
        await file_upload_el.set_input_files(path)
        return {"extracted_content": f'Successfully uploaded file to index {index}', "include_in_memory": True}
    except Exception as e:
        return {"error": f'Failed to upload file to index {index}: {str(e)}'}

async def main():
    browser = Browser()
    
    agent = Agent(
        task=upload_images,
        llm=ChatOpenAI(
            model='gpt-4o',
            api_key=os.getenv('OPENAI_API_KEY'),
        ),
        browser=browser,
        controller=controller,
        available_file_paths=available_image_paths
    )
    
    await agent.run()
    input('Press Enter to close the browser...')
    await browser.close()


if __name__ == '__main__':
    asyncio.run(main())