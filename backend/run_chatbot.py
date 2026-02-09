from dotenv import load_dotenv
import uvicorn

load_dotenv('backend/.env')

if __name__ == '__main__':
    uvicorn.run('backend.chatbot.main:app', host='127.0.0.1', port=8001, reload=True)
