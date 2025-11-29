# Dreamjob--Fihttps://youtu.be/uwobZDO0wlEhttps://youtu.be/uwobZDO0wlEhttps://youtu.be/uwobZDO0wlEnder
# Job Search Portal

A sleek web application that searches for jobs across LinkedIn, Indeed, ZipRecruiter, and Glassdoor all at once.

## What It Does

Search thousands of job listings from multiple platforms in one place. Filter by location, job type, remote options, and more. Clean interface, real-time results.

Youtube link :https://youtu.be/uwobZDO0wlE
Repo:https://github.com/kenny260/Dreamjob--Finder.git

## Getting Started

### Run It Locally

1. Download the files
   
   Dreamjob--Finder/
   ├── index.html
   ├── style.css
   ├── script.js
   ├── config.js
   └── README.md
   

2. Open `index.html` in your browser
   
3. Login with demo credentials:
   - Username: `demo`
   - Password: `demo123`

4. APP API key :cdff3c1f0emsh93a3b97416626e3p14e1dbjsnc48879c28de8  

5. Start searching!

That's it. No installation needed.

### Get Your Own API Key (Optional)
APP API key : 
The app comes with a demo API key, but you can get your own:
1. Sign up at [RapidAPI](https://rapidapi.com/rphrp1985/api/jobs-search-api)
2. Subscribe to the free plan (50-100 requests/month)
3. Click the settings icon in the app
4. Paste your new key

## Deploying to Servers

### Step 1: Upload to Web Servers

Copy all files to both web servers:

```bash
# On Web01
scp -r * user@web01-ip:/var/www/html/Dreamjob--Finder/

# On Web02
scp -r * user@web02-ip:/var/www/html/Dreamjob--Finder/


Set proper permissions:
```bash
sudo chown -R www-data:www-data /var/www/html/Dreamjob--Finder
sudo chmod -R 755 /var/www/html/Dreamjob--Finder


### Step 2: Configure Load Balancer

Edit HAProxy config on Lb01:

```bash
sudo nano /etc/haproxy/haproxy.cfg


Add this configuration:

```haproxy
frontend Dreamjob--Finder
    bind *:80
    default_backend web_servers

backend web_servers
    balance roundrobin
    server web01 <WEB01-IP>:80 check
    server web02 <WEB02-IP>:80 check


Restart HAProxy:
```bash
sudo systemctl restart haproxy


### Step 3: Test It

Visit your load balancer IP in a browser. The app should load, and traffic will be distributed between both servers.

Monitor the load balancer:
```bash
# Check HAProxy stats
http://<LB01-IP>:8080/stats


## Features

- Multi-platform search - LinkedIn, Indeed, ZipRecruiter, Glassdoor
- Smart filters - Job type, location, distance, remote options
- Modern design - Dark theme with smooth animations
- Fully responsive - Works on phones, tablets, and desktops
- No frameworks - Built with vanilla HTML, CSS, and JavaScript

## Common Issues

**No results showing up?**
- Check your internet connection
- Try a different search term
- Verify the API key in settings

Hit the rate limit?
- Free plan allows 50-100 requests per month
- Wait for the reset or upgrade your plan

Load balancer not working?
- Make sure both web servers are running
- Check that HAProxy is active: `sudo systemctl status haproxy`
- Review logs: `sudo tail -f /var/log/haproxy.log`

## Tech Stack

- HTML5, CSS3, Vanilla JavaScript
- Font Awesome icons
- Job Search API by PR Labs

## Credits

API provided by [PR Labs](https://rapidapi.com/rphrp1985/api/jobs-search-api)
Style .css :claude AI 
---

Built as a demonstration of API integration and web deployment with load balancing.
