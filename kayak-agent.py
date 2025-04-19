import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import asyncio

from dotenv import load_dotenv
from langchain_openai import ChatOpenAI

from browser_use import Agent

load_dotenv()

async def main():
    llm = ChatOpenAI(
        model='gpt-4o',
        temperature=0.0,
        api_key=os.getenv('OPENAI_API_KEY'),
    )
    task = 'Go to kayak.com and find the cheapest flight from Zurich to San Francisco on 2025-05-01'

    agent = Agent(task=task, llm=llm)
    await agent.run()


if __name__ == '__main__':
	asyncio.run(main())