# Three.js Physics Test

This project implements cannon-es and three.js to move objects in a 3d space by applying physics

It includes:

- Click event to apply forze on objects
- Raycast to find a point on the 3d object physical body and apply forze to that point
- Custom physics material definition

## Setup
Download [Node.js](https://nodejs.org/en/download/).
Run this followed commands:

``` bash
# Install dependencies (only the first time)
npm install

# Run the local server at localhost:8080
npm run dev

# Build for production in the dist/ directory
npm run build
```

## File distribution

- The JS is located in src/script.js
- The HTML is located in src/index.html
- The CSS is located in src/style.css
