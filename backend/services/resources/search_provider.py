class SearchProvider:
    def search(self, query: str, limit: int = 5) -> list[dict]:
        raise NotImplementedError
