from flask import Flask, request, jsonify
from flask_cors import CORS
from linkedin_scrape import *
#import requests
#import json
#import os
import re
import timeit

app = Flask(__name__)
CORS(app)

from flask import send_from_directory, make_response

@app.route('/api/update-geodata', methods=["GET", "POST"])
def update_geodata():
    tic = timeit.default_timer() # for developing purposes

    # gets request
    response = request.get_json()
    # cleans up user input
    job_title_str = response.get('jobTitle', 'Oil worker')
    job_title = " ".join((re.sub('[^A-Za-z ]+', '', job_title_str)).split()).upper()
    
    # NOT NEEDED AS WE READ DIRECTLY FROM THE GEOJSON FILE
    # data = get_job_data(job_title)
    update_geojson(job_title) # updates the geojson data
    
    toc = timeit.default_timer() # for developing purposes

    print(f'TOTAL TIME ELAPSED: {toc - tic}') # for developing purposes

    #if (job_title):
        #return jsonify(data)
    return ('', 204)
    

@app.route('/')
def index():
    return '<h1>idk why ur here tro</h1>'

if __name__ == '__main__':
    app.run(debug=True, port=8000)