# Food-Notes

## About **Food-Notes** 🍜

**Note** 
* _Yes, it's supposed to be a pun on "footnotes"_ 😸
* _This project is for educational purposes only. Not meant for commercial usage._

### Project description
A tool to help you keep track of your favourite eateries, but with a bunch of **personalisation** functionalities. Want to take _note_ if a restaurant is great for date night, is pet-friend, gives generous portion, or is simply your mom's favourite? You can easily record all these meaningful, and truly _personal_ information through **boards**, **tags** and **notes** (_coming soon_) features.

### Key functionalities
* Filter restaurants with specific price, neighborhood, categories, rating filters
* Create personal boards to "pin" (or save) restaurants
* Create personal tags to apply on your pinned restaurants
* Search and filter pinned restaurants in your profile

### Link
[https://food-notes-sg.herokuapp.com/](https://food-notes-sg.herokuapp.com/)

### Technologies
* HTML
* CSS
* Javascript
* Node / Express

### APIs used
* [Yelp API](https://www.yelp.com/developers/documentation/v3)

### Additional features for future development
* Search
* Personal Notes
* Filtering by tags
* Sharing
* Group boards

---

## About my process

### Approach
* As **Food-Notes** was meant to be a learning experience for Node.js, Express, EJS and MongoDB, my focus was on applying my new knowledge in building a functional full-stack application
  1. Utilsing **MVC** file structure
  2. Non-relational database management through MongoDB
  3. Building server & routing system through Express
  4. User authentication and sessions
  5. Deploying to Heroku  


* My workflow:
  1. Design data models and relationship between them
  2. Map out userflows & sort them into "must-haves" and "good-to-haves"
  3. Design wireframes for key pages
  4. Create MVC structure and start buildling

### Accomplishments
* **Database**:
  * Despite the many relationships between different collections (user < - restaurant -> board/tag), the app is able to recognize the linkage and pull data accordingly and accurately

* **Multiple RESTful routes and full CRUD**:
  * User is able to creat an account
  * User can create, edit, delete, and update boards
  * User can pin / remove a restaurant from their boards
  * User can create a tag and add/remove their tag from a restaurant
  * User can submit reviews

* **Filter system**:
  * While admittedly not 100% robust, I managed to implement a simple Filter system based on restaurants' Categories and Neighborhoods

### Challenges
* Time was definitely the biggest challenge - buidling a working full-stack application within 2 weeks, with a full-time job, was a hell of a task. I did not manage to achieve all that I have set out to do in the end.
* Some implementation are not the best way. Due to shortage of time, I did not have enough time to to deepdive into problems encountered along to find the best / most scalable solution for them. A lot of fixes are quite like 'brute forces'...