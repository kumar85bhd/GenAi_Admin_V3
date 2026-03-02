import json
from typing import List
from uuid import uuid4, UUID
from fastapi import APIRouter, Depends, HTTPException
from backend.core.dependencies import get_current_admin_user
from backend.schemas.user import UserInDB

router = APIRouter()

ADMIN_CONFIG_PATH = "admin_config.json"

def read_admin_config():
    """Read the admin configuration from the JSON file."""
    try:
        with open(ADMIN_CONFIG_PATH, "r") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {"dashboard_links": []}

def write_admin_config(config):
    """Write the admin configuration to the JSON file."""
    with open(ADMIN_CONFIG_PATH, "w") as f:
        json.dump(config, f, indent=2)

@router.get("/dashboard-links")
def get_dashboard_links(current_user: UserInDB = Depends(get_current_admin_user)):
    """Retrieve all admin dashboard links."""
    config = read_admin_config()
    return config.get("dashboard_links", [])

@router.post("/dashboard-links")
def create_dashboard_link(link: dict, current_user: UserInDB = Depends(get_current_admin_user)):
    """Create a new admin dashboard link."""
    config = read_admin_config()
    links = config.get("dashboard_links", [])
    link["id"] = str(uuid4())
    links.append(link)
    config["dashboard_links"] = links
    write_admin_config(config)
    return link

@router.put("/dashboard-links/{link_id}")
def update_dashboard_link(link_id: UUID, link_data: dict, current_user: UserInDB = Depends(get_current_admin_user)):
    """Update an existing admin dashboard link."""
    config = read_admin_config()
    links = config.get("dashboard_links", [])
    link_id_str = str(link_id)
    for i, link in enumerate(links):
        if link.get("id") == link_id_str:
            links[i] = {**link, **link_data, "id": link_id_str}
            config["dashboard_links"] = links
            write_admin_config(config)
            return links[i]
    raise HTTPException(status_code=404, detail="Link not found")

@router.delete("/dashboard-links/{link_id}")
def delete_dashboard_link(link_id: UUID, current_user: UserInDB = Depends(get_current_admin_user)):
    """Delete an admin dashboard link."""
    config = read_admin_config()
    links = config.get("dashboard_links", [])
    link_id_str = str(link_id)
    new_links = [link for link in links if link.get("id") != link_id_str]
    if len(new_links) == len(links):
        raise HTTPException(status_code=404, detail="Link not found")
    config["dashboard_links"] = new_links
    write_admin_config(config)
    return {"message": "Link deleted"}
