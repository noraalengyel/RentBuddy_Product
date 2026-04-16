#  RentBuddy – Rental Transparency Platform

## Overview

RentBuddy is a full-stack web application designed to improve transparency in the rental market.
It allows users to explore properties, read and write reviews, track hidden costs, and make informed renting decisions.

The platform focuses on real user experiences, helping students and young professionals avoid misleading rental listings.

## Features
### Property Browsing
  * Browse rental properties with detailed information
  * View location, price, and key features
  * Filter and explore listings easily
### Review System
* Submit reviews for properties
* Rate categories such as:
* Landlord communication
* Maintenance speed
* Cleanliness
* Safety
* Value for money
* Anonymous review option
* View all reviews per property
### Photo Upload 
* Upload images when submitting reviews
* Photos are stored in the database (Base64 format)
* Helps provide visual evidence of property conditions
* Hidden Costs Transparency
* Report additional costs (bills, unexpected fees)
* Highlight misleading listings
### Saved Properties
* Save and manage favourite listings
* Compare multiple properties
### User Profile System
* User account management
* Profile settings (name, email, location)
* View the number of reviews written
* Track user activity
### My Reviews Page
* View all reviews written by the user
* Navigate back to reviewed properties
### Contact Landlord
* Submit inquiries about properties
* Stores inquiries in the database
* (Optional) Email confirmation system
## Tech Stack
### Frontend
* React
* JavaScript (ES6+)
* CSS (custom styling)
* React Router
### Backend
* Node.js
* Express.js
### Database
* SQLite (better-sqlite3)
### Other Tools
* Mailto (email system)
* Git & GitHub
## Project Structure
```
src/
  ├── assets/
  ├── components/
  ├── config/
  ├── data/
  ├── pages/
  └── utils/
server/
  ├── controllers/
  ├── routes/
  ├── db/
  └── index.js
```
## Installation & Setup
* Clone the repository
```
git clone https://github.com/noraalengyel/rentbuddy.git
cd rentbuddy
```
## Install dependencies
### Client
```
cd RentBuddy_Product
npm install
```
### Server
```
cd ../server
npm install
```
### Run the project
* Start backend
```
cd server
npm run dev
```
* Start frontend
```
cd RentBuddy_Product
npm run dev
```
### Database Setup
* If running for the first time
```
npm run seed:properties
npm run seed:reviews
```
## Key Learning Outcomes
* Built a full-stack application using React and Express
* Designed and implemented a relational database (SQLite)
* Developed a RESTful API architecture
* Implemented user authentication and profile management
* Handled file uploads (Base64 image storage)
* Integrated email functionality using Nodemailer
* Improved UI/UX with responsive design principles
## Authors
### Nora Lengyel
### Enita Hashemi
