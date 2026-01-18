import json
import os
from django.conf import settings
from django.http import JsonResponse
from datetime import datetime

# Helper to load data
def get_jobs_data():
    # Assumes jobs.json is in the same directory as this views.py file
    json_path = os.path.join(os.path.dirname(__file__), 'jobs.json')
    try:
        with open(json_path, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return []

def job_list(request):
    jobs = get_jobs_data()
    
    # 0. ID Filter (Used for "Saved Jobs" drawer)
    # If ?ids=1,2,3 is passed, we filter ONLY those jobs immediately.
    ids = request.GET.get("ids")
    if ids:
        try:
            # Convert "1,2,3" string into a list of integers [1, 2, 3]
            id_list = [int(i) for i in ids.split(",") if i.strip().isdigit()]
            jobs = [j for j in jobs if j["id"] in id_list]
        except ValueError:
            pass

    # 1. Search Filter (q)
    q = request.GET.get("q", "").lower()
    if q:
        jobs = [
            j for j in jobs 
            if q in j["title"].lower() 
            or q in j["company"].lower() 
            or q in j["location"].lower()
        ]

    # 2. Location Filter
    location = request.GET.get("location")
    if location:
        jobs = [j for j in jobs if location.strip().lower() in j["location"].lower()]

    # 3. Job Type Filter
    job_type = request.GET.get("job_type")
    if job_type:
        jobs = [j for j in jobs if j["job_type"] == job_type]

    # 4. Experience Filter
    min_exp = request.GET.get("min_exp")
    max_exp = request.GET.get("max_exp")
    if min_exp and max_exp:
        jobs = [
            j for j in jobs 
            if j["experience"] >= int(min_exp) and j["experience"] <= int(max_exp)
        ]

    # 5. Salary Filter
    min_salary = request.GET.get("min_salary")
    max_salary = request.GET.get("max_salary")
    if min_salary and max_salary:
        # Logic: Job covers the range if its max is >= user_min AND its min <= user_max
        jobs = [
            j for j in jobs 
            if j["salary_max"] >= int(min_salary) and j["salary_min"] <= int(max_salary)
        ]

    # 6. Sorting
    sort = request.GET.get("sort", "-match_score")
    reverse = False
    key = sort
    
    if sort.startswith("-"):
        reverse = True
        key = sort[1:] # remove the minus sign
    
    # Sort the list of dictionaries
    # We use a default value (0 or "") to avoid errors if a field is missing
    jobs.sort(key=lambda x: x.get(key, 0), reverse=reverse)

    # 7. Pagination
    # Note: If fetching saved jobs (ids present), you might want to increase limit 
    # in the frontend request, or we can default to showing all if ids are present.
    # For now, we stick to the standard logic:
    total_count = len(jobs)
    limit = int(request.GET.get("limit", 10))
    offset = int(request.GET.get("offset", 0))
    
    paginated_jobs = jobs[offset : offset + limit]

    return JsonResponse(paginated_jobs, safe=False)


def locations_list(request):
    jobs = get_jobs_data()
    # Extract unique locations using a set
    locations = list(set(j["location"] for j in jobs))
    locations.sort()
    return JsonResponse(locations, safe=False)