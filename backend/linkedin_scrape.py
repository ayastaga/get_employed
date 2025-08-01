import requests
import os
from dotenv import load_dotenv
from bs4 import BeautifulSoup
from supabase import create_client, Client
import json
from datetime import datetime, timezone

load_dotenv()
url = os.environ.get('SUPABASE_URL')
key = os.environ.get('SUPABASE_API_KEY')

supabase: Client = create_client(url, key)

TABLE_NAME = 'job_information_duplicate'
US_STATES = ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"]
DATABASE_UPDATE_TIMER = 21600

def get_job_data(prompt):
    data = []
    current_time = datetime.now(timezone.utc)

    for state in US_STATES[:1]:
        # if data for the state doesn't exist, then scrape & push
        original_fetch_req = fetch_from_supabase(prompt, state).data
        if len(original_fetch_req) == 0:
            job_list = scrape(prompt, state)
            push_to_supabase(prompt, state, job_list)
        else:
            database_timestamp = datetime.fromisoformat(original_fetch_req[0]['created_at'])
            if (current_time - database_timestamp).seconds > DATABASE_UPDATE_TIMER:
                delete_from_supabase(prompt, state)
                job_list = scrape(prompt, state)
                push_to_supabase(prompt, state, job_list) 

        data.append(fetch_from_supabase(prompt, state).data)
    
    return data

def delete_from_supabase(prompt, location):
    try:
        response = (
            supabase.table(TABLE_NAME)
            .delete()
            .eq("location", location)
            .eq("prompt", prompt)
            .execute()
        )
        print("DELETED FROM SUPABASE 🗑️")
    except Exception as e:
        print(f'❌ 🗑️ UNABLE TO DELETE DATA : {e}')

def push_to_supabase(prompt, location, job_list):
    for job in job_list:
        try:           
            (
                supabase.table(TABLE_NAME)
                .insert({'job_title' : job['job_title'],
                        'company_name' : job['company_name'],
                        'posting_time' : job['posting_time'],
                        'applicant_count' : job['applicant_count'],
                        'location' : location,
                        'prompt' : prompt,
                        'job_link' : job['job_link'],
                        'company_link' : job['company_link'],
                        'seniority_lvl' : job['seniority_lvl'],
                        'employment_type' : job['employment_type'],
                        'job_function' : job['job_function'],
                        'industries' : job['industries']
                        })
                .execute()
            )
            print('PUSHED TO SUPABASE 🫸')
        except Exception as e:
            print(f'❌ 🫸 UNABLE TO PUSH TO SUPABASE: {e}')
        

def fetch_from_supabase(prompt, location):
    try:
        response = (
            supabase.table(TABLE_NAME)
            .select('*')
            .eq("location", location)
            .eq("prompt", prompt)
            .execute()
        )
        print("FETCHED FROM SUPABASE 🫴")
        return response
    except Exception as e:
        print(f'❌ 🫴 UNABLE TO FETCH FROM SUPABASE: {e}')
        return None

def update_geojson(prompt):
    res = requests.get('https://docs.mapbox.com/mapbox-gl-js/assets/us_states.geojson').json()
    
    for x in res['features']:
        x['properties']['description'] = fetch_from_supabase(prompt, x['properties']['STATE_NAME']).data
    
    with open('../frontend/public/new.geojson', 'w') as file:
        json.dump(res, file)


def scrape(title, location, queryLength=1):
    id_list, job_list = [], []
    list_url = f"https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords={title}&location={location}&start={queryLength}"
    
    response = requests.get(list_url)
    list_data = response.text
    list_soup = BeautifulSoup(list_data, "html.parser")
    page_jobs = list_soup.find_all("li")
    for job in page_jobs: 
        base_card_div = job.find("div", {"class" : "base-card"})
        job_id = int(base_card_div.get("data-entity-urn").split(":")[3])
        id_list.append(job_id)
    
    job_list = extract_details(id_list)
    return job_list

def extract_details(id_list):
    job_list = []
    for job_id in id_list:
        job_post = {}
        job_url = f"https://www.linkedin.com/jobs-guest/jobs/api/jobPosting/{job_id}"
        headers = {'User-Agent' : 'Mozilla/5.0'}

        job_response = requests.get(job_url, headers=headers)
        job_soup = BeautifulSoup(job_response.text, 'html.parser')

        # job link
        try:
            job_link_tag = job_soup.find('a', {'class' : 'topcard__link'})
            job_post['job_link'] = job_link_tag['href'] if job_link_tag else None
        except:
            job_post['job_link'] = None
        
        # company link
        try:
            company_link_tag = job_soup.find('a', {'data-tracking-control-name': 'public_jobs_topcard_logo'})
            job_post['company_link'] = company_link_tag['href'] if company_link_tag else None
        except:
            job_post['company_link'] = None
        
        # job title
        try:
            job_post['job_title'] = job_soup.find('h2', {'class' : 'top-card-layout__title font-sans text-lg papabear:text-xl font-bold leading-open text-color-text mb-0 topcard__title'}).text.strip()
        except:
            job_post['job_title'] = None

        # company name
        try:
            job_post['company_name'] = job_soup.find('a', {'class' : 'topcard__org-name-link topcard__flavor--black-link'}).text.strip()
        except:
            job_post['company_name'] = None
        
        # seniority_lvl | employment_type | job_function | industries
        for item in job_soup.select('li.description__job-criteria-item'):
            key_elem = item.find('h3', class_='description__job-criteria-subheader')
            val_elem = item.find('span', class_='description__job-criteria-text--criteria')

            if key_elem and val_elem:
                key = key_elem.get_text(strip=True)
                value = val_elem.get_text(strip=True)
                
                match key:
                    case 'Seniority level':
                        job_post['seniority_lvl'] =  value
                    case 'Employment type':
                        job_post['employment_type'] = value
                    case 'Job function':
                        job_post['job_function'] = value
                    case 'Industries':
                        job_post['industries'] = value

        # posting time
        try:
            job_post['posting_time'] = job_soup.find('span', {'class' : 'posted-time-ago__text topcard__flavor--metadata'}).text.strip()
        except:
            job_post['posting_time'] = None

        # number of applicants
        try:
            job_post['applicant_count'] = job_soup.find('figcaption', {'class' : 'num-applicants__caption'}).text.strip()
        except:
            job_post['applicant_count'] = None
        

        # append all that info
        job_list.append(job_post)
    return job_list
