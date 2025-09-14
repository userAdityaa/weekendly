# Weekendly - Plan Your Perfect Weekend  
**Developed by: Aditya Chaudhary**  

Weekendly is a weekend planning application designed to help you organize your activities, track past plans, and share ideas with friends.  
Everything from the logo to the complete UI is uniquely designed for this project.  

---

## Live Demo  
[Weekendly Planner](https://weekendly-planner.vercel.app/)  
[Video Tour](https://www.loom.com/share/8c84b45e11b14ed9abb2dd4be94fcfd4?sid=61ce22f0-3474-4f44-9383-fb0d47a0babb)  

---

## Features  

### Core Functionality  
- Create and manage weekend plans with activities, locations, time, and notes  
- Friend list to keep track of who joined your past plans  
- Most visited places highlighted for quick access  
- Public or Private plans – inspire others or keep your plans personal  
- Posts Section – browse and like public plans from the community  

### Productivity Tools  
- Search locations with Google Maps integration (no external app required)  
- Calendar & Reminders – prevents adding past events  
- Reorder plans with drag-and-drop scheduling  

### Interactive Elements  
- Confetti celebration when making a plan public  
- Fun card-flip memory game built into the dashboard  
- Smooth animations & responsive design for both desktop and mobile  

---

## Tech Stack  
- Framework: Next.js (App Router)  
- Language: TypeScript  
- Styling: Tailwind CSS (with custom animations)  
- Persistent Storage: LocalStorage (no backend required)  
- Maps Integration: Google Maps API  

---

## Major Design Decisions & Trade-offs  
1. Frontend-only with LocalStorage → Simple & offline, but no multi-device sync  
2. Next.js App Router + TypeScript → Modern & modular, but adds boilerplate  
3. Fun + Utility Mix → Confetti, memory game → engaging but extra effort  
4. Google Maps API → Seamless location search, but API dependency  

---

## Component Design & State Management  
- Modular components: `Dashboard`, `PlanWizard`, `LocationSearch`, `SortableItem`  
- State management with React state + localStorage sync  
- Fallbacks & validations (no past events, TBD placeholders)  

---

## UI Polish & Experience  
- Responsive design with Tailwind CSS  
- Hover & transition animations  
- Card-flip effects for memory game  
- Drag-and-drop for plan reordering  
- Confetti visuals to celebrate making plans public  

---

## Creative Features & Integrations  
- Built-in memory game for fun  
- PDF export with jsPDF for sharing itineraries  
- Google Maps autocomplete for location search  

---

## Getting Started  

### Installation  
```bash
# Clone the repository
git clone https://github.com/userAdityaa/weekendly-planner.git

# Navigate into the project directory
cd weekendly-planner

# Install dependencies
npm install
```

### Screenshots of the UI
<img width="1440" height="900" alt="Screenshot 2025-09-14 at 5 27 59 PM" src="https://github.com/user-attachments/assets/66766d99-5cee-4719-a891-1d99267a1349" />
<img width="1440" height="900" alt="Screenshot 2025-09-14 at 5 30 00 PM" src="https://github.com/user-attachments/assets/e08e569b-1214-4c38-90cc-5b57a4cdb654" />
<img width="1440" height="900" alt="Screenshot 2025-09-14 at 5 30 45 PM" src="https://github.com/user-attachments/assets/b7af18ab-28d2-462f-812b-ea912c6b0f24" />
<img width="1440" height="900" alt="Screenshot 2025-09-14 at 5 30 56 PM" src="https://github.com/user-attachments/assets/246e9032-11e9-4586-a76e-0ac8dbce71dd" />
<img width="1440" height="900" alt="Screenshot 2025-09-14 at 5 31 08 PM" src="https://github.com/user-attachments/assets/9aa896c7-428d-4a74-af28-653bda3b334c" />
<img width="1440" height="900" alt="Screenshot 2025-09-14 at 5 31 42 PM" src="https://github.com/user-attachments/assets/b64bd342-ffb7-4643-bf10-daa66ed7f5c1" />
