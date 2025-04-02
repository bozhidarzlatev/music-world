# music-world
Hello there!
My name is Bozhidar Zlatev and this is my SoftUni ReactJS Course final project - apr 2025.

 

# Summary
This is my React app for music lovers where you can buy instruments, albums, merch and book concert tickets, all in one place.
Main features of the app are:
    - register and login functionalities  
    - guest and user features based on the state  
    - Browse all and add new item features  
    - Search
    - Add to cart  
    - Make order   
    - Leave reviews
    - Toast notifications

For front-end development is used React with Vite and for back-end is used SoftUni Practice server 

# Music World App Features
    1 - Home menu  - Available for everyone  
        - Quick links to login and register
        - Lates item
        - Top rated item
        - Top Reviews 
    2 - Browse All - Available for everyone  
        - Gives quick links to all categories  
        - When category is chosen you are redirected to all items of that categoty  
        - You can go to details view from catalog card  
    3 - Details View - Available for everyone    
        - Gives detailed view about the item  
        - Buttons appears according to state and activity    
        - Only owner can Edit and Delete items  
        - Owner can't review item, but cat add it to cart  
        - Only one review can be placed  
    4 - Search - Available for everyone  
        - Search based on title, case insensitive, partial search  
    5 - Add/Edit items - Available only for logged-in users  
        - Gives ability to add and edit - only owner of the item can edit it  
    6 - Cart - Available only for logged-in users  
        - Tracks count of items in the cart  
        - Gives ability to place order  
    7 - Profile - Available only for logged-in users  
        - Quick links to all your activities  
    8 - Login, Logout, Register 
        - Login users can't access Login and Register
        - Guest users can't access Logout

Enjoy!

# How to run the app
    - client - from main folder - cd server => npm i => npm run dev
    - server - from main folder - cd server => node server

# Development steps
    - Add basic summary
    - Add SoftUni Practice server
    - Set React and clean default views        
    - Add basic reset.css, Site Icon, fonts and etc.
    - Added basic Header component - only HTML and CSS
    - Added bacis Home component - only HTML and CSS
    - Added basic Footer component - only HTML and CSS
    - Added Categories component - only HTML and CSS
    - Added basic Login and Register components - only HTML and CSS
    - Added basic Catalog components - only HTML and CSS
    - Added basic Details components - only HTML and CSS
    - Login Functionality added
    - Context added
    - Dynamic Header navigarion added
    - Register Func Added
    - Logout Func Added
    - Create new item component added
    - Add create new item func
    - Add view catalog items func
    - Deails view func added
    - Edit func added
    - Delete func added
    - Add basic Add review func
    - View review func added
    - Basic data seed 
    - usePersistantStata - added localStorage for managing state 
    - Guards Added
    - Review functionality update
    - useOptimistic added
    - Add and Edit views upgrades
    - Add to cart func
    - Added latest items and top Reviews at home view
    - Place order func added
    - view cart func added
    - View all order func added
    - Add Profile component
    - Review guards added
    - Pagination added
    - Home page improvements
    - Login and Register form validations added
    - Bug fixes
    - Cart state fixed - Added CartContext
    - Cart state fixes
    - Search component added
    - Search functionality added
    - Search pagination
    - Header style fixes
    - 404 Page added
    - Toasts added
    - Toasts added to add, edit and delete items
    - Bug Fixes
    - ReviewCarousel comp added
    - Search fix
    - Profile data - user items and user reviews added
    - Final touches
    - Final commit with app description
    - StrictMode removed -> it makes problem when cart is open. It doubles the items in it. As it 22:50 i have no power and will to investigate ;)