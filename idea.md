in short;
the idea is super simple.
create an ai agent that can list items on olx.uz

the agent should be able to:
- handle olx.uz login
- list items on olx.uz
- upload images to olx.uz
- submit the listing

ui: 
- chatgpt like interface
- user drag and drops images to the chat,
than enters prompt, for example: "list this iPhone. write compelling description and fill out all required details. use these images as reference for this listing. then upload the listing to olx.uz"

backend: 
- browser-use with ai agents
- use docker to run the agent
- browser should be headless chrome
- send the intermediate steps to the user, like "uploading images to olx.uz", writing description, some other data, etc.
- send the final listing url to the user

