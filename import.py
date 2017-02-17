#!/usr/bin/env python

# Make sure to install requests before running:
# > pip install requests

import requests

url = "https://data.sfgov.org/resource/75rg-imyz.json"

response = requests.get(url)
if response.status_code == 200:
    data = response.json()
    print(data)
