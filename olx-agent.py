from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from browser_use import Agent, Browser
import os
import asyncio

load_dotenv()

with open('task.md', 'r') as f:
    task = f.read()


async def main():
    browser = Browser()
    
    agent = Agent(
        task=task,
        llm=ChatOpenAI(
            model='gpt-4o',
            api_key=os.getenv('OPENAI_API_KEY'),
        ),
        browser=browser,
    )
    
    await agent.run()
    input('Press Enter to close the browser...')
    await browser.close()


if __name__ == '__main__':
    asyncio.run(main())