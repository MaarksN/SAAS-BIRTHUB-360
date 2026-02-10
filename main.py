from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from routers import ldr, bdr, sdr, ae
import uvicorn

app = FastAPI(
    title="SalesOS AI Agents",
    description="Microserviço de Inteligência Artificial para Automação de Vendas",
    version="1.0.0"
)

# Configuração de CORS para permitir acesso do Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Em produção, restrinja para o domínio do frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusão dos roteadores de domínio
app.include_router(ldr.router, prefix="/api/v1", tags=["LDR - Market Intelligence"])
app.include_router(bdr.router, prefix="/api/v1", tags=["BDR - Outbound"])
app.include_router(sdr.router, prefix="/api/v1", tags=["SDR - Inbound"])
app.include_router(ae.router, prefix="/api/v1", tags=["AE - Closing"])

@app.get("/health", status_code=200)
def health_check():
    return {"status": "operational", "service": "ai-agents-core"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
