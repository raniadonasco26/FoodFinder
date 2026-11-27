# FoodFinder Presentation Guide

FoodFinder helps diners discover restaurants in Cebu City, check locations, and view available menus and prices in Philippine pesos. Its owner portal gives verified restaurant representatives a way to publish menu items and maintain their map location.

This guide assumes a 10-minute classroom or project-defense presentation followed by questions. Replace the team details and use screenshots from your own running app.

## Presentation at a glance

| Time | Topic | What to show |
| --- | --- | --- |
| 0:00–0:45 | Introduction | Title slide and landing page |
| 0:45–1:45 | Problem and scope | A diner’s search and the Cebu City boundary |
| 1:45–3:00 | Users and workflow | Diner, owner, and reviewer responsibilities |
| 3:00–4:00 | Architecture | React, OpenStreetMap, Leaflet, and Supabase |
| 4:00–7:30 | Live demonstration | Explore, restaurant details, and owner dashboard |
| 7:30–9:00 | Verification and limitations | What was tested and what depends on live setup |
| 9:00–10:00 | Conclusion | Recap and questions |

## Slides and speaker notes

### Slide 1 FoodFinder

**On the slide**

FoodFinder · Restaurant discovery and menu publishing in Cebu City

[Team members] · [Course or organization] · [Presentation date]

**Say**

“Good day. We’re presenting FoodFinder, a web app for finding restaurants in Cebu City and checking what they serve. We’ll show the diner experience first, then how a verified owner can publish that information.”

### Slide 2 The problem and project scope

**On the slide**

- Diners want to know where a restaurant is, what it serves, and how much dishes cost.
- Restaurant teams need a way to keep their menu and location information current.
- FoodFinder focuses on discovery, maps, restaurant details, and menu publishing in Cebu City.

**Say**

“Imagine deciding where to eat near your current location. A map pin can tell you where a restaurant is. The menu and price help you decide whether to go. FoodFinder brings those details together when the restaurant makes them available.”

### Slide 3 Users and permissions

| User | What they can do |
| --- | --- |
| Diner or visitor | Browse Explore, view the Cebu City map, open restaurant details, and read available menus. Diners can also register and sign in. |
| Restaurant owner | Sign in at the owner portal, claim an existing listing or submit a new one, and track its review status. After approval, publish the restaurant’s location and menu. |
| Designated reviewer | Check that a claimant represents the business, verify the listing or proposed location, and approve or reject the request. |

**Say**

“An owner can sign in and submit a claim. Approval is the step that grants editing rights for that restaurant. One owner’s approval gives them access only to the listing they represent.”

### Slide 4 How the system works

**On the slide**

- React and Vite run the web interface.
- Leaflet displays the map. The app retrieves restaurant listings from OpenStreetMap through Overpass.
- Supabase Auth handles email and password accounts. Supabase PostgreSQL stores claims, menu drafts, published menus, and owner-submitted locations.
- Database access rules keep drafts and claim evidence private. Public restaurant pages read the published menu.

**Say**

“Each OpenStreetMap listing has an element type and ID. FoodFinder uses that identity to associate an owner’s published menu with the right restaurant. Restaurants submitted directly through FoodFinder get their own listing ID. When the owner publishes, the database saves a public copy of the current draft, so later edits stay private until republished.”

### Slide 5 The diner experience

**On the slide**

Landing-page search → Explore → Cebu City map → Restaurant details → Available menu

**Say**

“The landing page accepts a restaurant name, dish, or cuisine. Explore opens in the restaurant view, and the Cebu City map is a separate tab. The restaurant filter cards currently use labeled demonstration data. The map loads OpenStreetMap listings and approved owner-posted locations when available.”

**Show**

Submit a sample search, switch to the Cebu City map, and select a visible restaurant pin. If you show **Use my location**, the browser must grant permission and the detected location must be in Cebu City. The position is labeled **You are here**.

### Slide 6 The owner and reviewer workflow

**On the slide**

Sign in → Claim or submit → Reviewer decision → Edit location or menu → Publish

**Say**

“Owners can claim a restaurant already on the map or submit a new Cebu City listing with an address, coordinates, and proof of representation. A reviewer checks the request. Once approved, the owner can edit the restaurant location and save menu items as drafts. Publishing updates what diners can see.”

**Show**

Use an already-approved test listing to demonstrate the editor. Point out the dish name, category, description, price, photo URL, and availability. Show **Save draft**, **Publish menu**, and **Unpublish menu**. Use a pre-approved test listing so the demonstration does not depend on a reviewer being available during the presentation.

### Slide 7 Map usability and performance

**On the slide**

- The map masks areas outside the Cebu City boundary.
- Page scrolling works over the map by default. **Pan map** enables dragging.
- The map renders up to **100 restaurant pins per view** and refreshes them after panning or zooming.

**Say**

“The map keeps the display focused on Cebu City. The 100-pin cap applies to rendered markers in the current view. Panning or zooming lets you explore another area and see the restaurants there.”

### Slide 8 Verification, limits, and conclusion

**On the slide**

- The production build and local PostgreSQL permission checks passed during development.
- The live owner flow requires both Supabase migrations, confirmed test accounts, and a designated reviewer.
- Some restaurants have an official website or menu link. If a menu source is unavailable, the details page shows the unavailable state.

**Say**

“FoodFinder brings together restaurant discovery, location, and available menu prices. The verification step gives restaurants a controlled way to publish corrections and updates. Our local database checks covered approval, owner-only changes, and public access to published information.”

## Live demo runbook

| Step | Action | What to point out |
| --- | --- | --- |
| 1 | Open the landing page and search for a term you rehearsed, such as `ramen`. | Search takes you to Explore with the submitted query. Identify sample cards as demonstration data. |
| 2 | Open **Cebu City map**. Scroll over it, then select **Pan map** and drag. | The map does not interrupt normal page scrolling by default. |
| 3 | Select a pin and open its restaurant details. | Show the name, address, and official menu link or published menu when available. |
| 4 | Switch to a separate browser profile already signed in at `/owner`. Select an approved test listing. | Explain the claim status and who can publish. Keep credentials and ownership evidence off screen. |
| 5 | Show the location editor and save a prepared menu item as a draft on a test listing. | Highlight Cebu City coordinates, category, peso price, and availability. |
| 6 | Select **Publish menu**, then reload that listing in the diner tab. | The saved dish appears in the public menu. Publish only information you have permission to share. |

## Before presenting

- Run `npm run dev` and open `http://localhost:5173/`.
- Follow the [Supabase setup guide](supabase/README.md). Check both migrations, the reviewer assignment, and the email-confirmed diner and owner accounts.
- Rehearse the diner and owner tabs in separate browser profiles so their sessions stay separate. Confirm the owner sees **Owner dashboard** and an approved test listing.
- Pick a listing with a visible menu or prepare a test listing with authorized menu content. Verify that the map and listings load on the presentation network.
- Capture screenshots of the landing page, map, restaurant details, and owner editor. Use them if an external service is unavailable. If the live database is still missing migrations, present the owner flow as implemented and describe its live setup requirement. Show only the steps you actually rehearsed.

## Likely panel questions

**Where does the restaurant data come from?**

The map uses OpenStreetMap listings through Overpass, plus restaurant locations published by approved owners. The landing-page and Explore demonstration cards are labeled sample data.

**How do you know who owns a restaurant?**

A reviewer checks the claim and confirms the applicant represents that restaurant. The database grants editing and publishing rights only to the approved account for that listing.

**Does OpenStreetMap supply food prices?**

OpenStreetMap may provide a restaurant website or menu link. FoodFinder displays structured menu items and prices when an approved restaurant owner publishes them.

**What happens when an owner changes a draft?**

Diners continue to see the last published copy until the owner publishes the changes. Unpublishing removes the owner-published copy from public view.

**Why are there only 100 pins?**

The cap limits how many markers the browser draws at once. The app prioritizes visible restaurants near the center when there are more than 100 and updates the set after panning or zooming.

**Can people outside Cebu City still browse?**

Yes. Anyone can browse the Cebu City map. The app shows their position as **You are here** only when the browser reports a location within the city.

**Can diners order food through FoodFinder?**

FoodFinder covers restaurant discovery, locations, and menu browsing. A diner can use the restaurant’s official link when one is available.

## Closing line

“FoodFinder helps diners decide where to eat and gives verified restaurant owners a way to keep the information behind that decision current. Thank you. We’re ready for questions.”
