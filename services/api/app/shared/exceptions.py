from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse


class NotFoundError(Exception):
    def __init__(self, resource: str, resource_id: object = None) -> None:
        self.resource = resource
        self.resource_id = resource_id
        detail = f"{resource} não encontrado"
        if resource_id:
            detail += f": {resource_id}"
        super().__init__(detail)


class ConflictError(Exception):
    def __init__(self, detail: str) -> None:
        super().__init__(detail)


class ForbiddenError(Exception):
    def __init__(self, detail: str = "Acesso negado") -> None:
        super().__init__(detail)


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(NotFoundError)
    async def not_found_handler(_: Request, exc: NotFoundError) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"code": "NOT_FOUND", "message": str(exc)},
        )

    @app.exception_handler(ConflictError)
    async def conflict_handler(_: Request, exc: ConflictError) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content={"code": "CONFLICT", "message": str(exc)},
        )

    @app.exception_handler(ForbiddenError)
    async def forbidden_handler(_: Request, exc: ForbiddenError) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content={"code": "FORBIDDEN", "message": str(exc)},
        )
