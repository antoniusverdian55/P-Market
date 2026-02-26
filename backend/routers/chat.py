"""
Chat Router — GLM-4 AI chat with WebSocket streaming support.
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from models.schemas import ChatRequest, ChatResponse
from engines.glm_engine import chat_completion, chat_completion_stream
from datetime import datetime
import uuid
import asyncio

router = APIRouter()


@router.post("/message", response_model=ChatResponse)
async def send_message(request: ChatRequest):
    """Send a message to GLM-4 and get a response."""
    response_text = chat_completion(
        user_message=request.message,
        portfolio_context=None,  # TODO: inject real portfolio data
        market_data=None,
    )

    return ChatResponse(
        id=str(uuid.uuid4()),
        role="assistant",
        content=response_text,
        timestamp=datetime.now().isoformat(),
        has_chart=False,
    )


@router.websocket("/stream")
async def chat_stream(websocket: WebSocket):
    """WebSocket endpoint for streaming GLM-4 responses."""
    await websocket.accept()

    try:
        while True:
            # Receive message from client
            data = await websocket.receive_json()
            user_message = data.get("message", "")
            mode = data.get("mode", "simple")

            if not user_message:
                await websocket.send_json({"type": "error", "content": "Empty message"})
                continue

            # Send start signal
            await websocket.send_json({
                "type": "start",
                "id": str(uuid.uuid4()),
                "timestamp": datetime.now().isoformat(),
            })

            # Stream response
            full_response = ""
            async for chunk in chat_completion_stream(user_message):
                full_response += chunk
                await websocket.send_json({
                    "type": "chunk",
                    "content": chunk,
                })
                await asyncio.sleep(0.02)  # Small delay for smooth streaming

            # Send completion signal
            await websocket.send_json({
                "type": "end",
                "content": full_response,
                "timestamp": datetime.now().isoformat(),
            })

    except WebSocketDisconnect:
        print("Client disconnected from chat stream")
    except Exception as e:
        await websocket.send_json({"type": "error", "content": str(e)})
