from typing import Dict, Any

class GraphIngestor:
    def __init__(self):
        # In production: self.driver = GraphDatabase.driver(uri, auth=(user, password))
        self.nodes = []
        self.edges = []

    def ingest_company_profile(self, data: Dict[str, Any]):
        """
        Creates nodes and relationships from a company profile.
        """
        company_node = {
            "type": "Company",
            "id": data.get("cnpj") or data.get("name"),
            "properties": {"name": data.get("name"), "segment": data.get("segment")}
        }
        self.nodes.append(company_node)

        # Example: Link to Investors or Partners if available
        if "investors" in data:
            for investor in data["investors"]:
                inv_node = {"type": "Investor", "id": investor}
                self.nodes.append(inv_node)
                self.edges.append({
                    "from": investor,
                    "to": company_node["id"],
                    "type": "INVESTED_IN"
                })

        print(f"[Graph] Ingested {company_node['id']} with {len(self.edges)} relationships.")
        return True

    def get_summary(self):
        return {"nodes": len(self.nodes), "edges": len(self.edges)}
