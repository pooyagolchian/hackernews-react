# Hackernews React Clone

## Overview

This project is a clone of the Hacker News website built using React, TypeScript, Vite, Zustand for state management, and TailwindCSS for styling. The app fetches stories from the Hacker News API and includes infinite scrolling and real-time updates.

## Table of Contents

1. [Features](#features)
2. [Technologies](#technologies)
3. [Project Structure](#project-structure)
4. [Installation](#installation)
5. [Usage](#usage)
6. [State Management](#state-management)
7. [Styling](#styling)
8. [Contributing](#contributing)
9. [License](#license)

## Features

- Fetches Hacker News stories via API
- Infinite scrolling with auto-pagination
- Zustand for global state management
- TailwindCSS for responsive design
- Built with React + TypeScript and Vite for fast builds
- ESLint and Prettier configured for code consistency

## Technologies

- **React 18.3** - Core frontend library
- **TypeScript** - Static type-checking
- **Vite** - Fast build tool and dev server
- **Zustand** - Lightweight state management
- **TailwindCSS** - Utility-first CSS framework
- **Hacker News API** - Data source for stories
- **ESLint** - Code linting
- **Prettier** - Code formatting

## Project Structure

```
root/
│
├── public/                # Public assets
├── src/                   
│   ├── components/        # React components
│   ├── hooks/             # Custom React hooks
│   ├── pages/             # Page components (Home, Story, etc.)
│   ├── store/             # Zustand store files
│   ├── App.tsx            # Main application component
│   ├── index.scss         # Global SCSS styles
│   ├── main.tsx           # Entry point of the app
│   └── vite-env.d.ts      # Vite environment types
│
├── package.json           # Project configuration and dependencies
├── postcss.config.js      # PostCSS configuration for TailwindCSS
├── tailwind.config.js     # TailwindCSS configuration
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite configuration
└── README.md              # Documentation
```

## Installation

1. **Clone the repository**:

    ```bash
    git clone https://github.com/pooyagolchian/hackernews-react.git
    cd hackernews-react
    ```

2. **Install dependencies**:

    ```bash
    pnpm install
    ```

3. **Start the development server**:

    ```bash
    pnpm dev
    ```

4. **Build for production**:

    ```bash
    pnpm build
    ```

## Usage

- Open your browser and go to `http://localhost:5173` to see the app in action.
- Infinite scrolling will automatically load more stories as you scroll down.

## State Management

State is managed using Zustand. The store handles pagination and story fetching from the Hacker News API.

```typescript
import create from 'zustand';

const useStore = create((set) => ({
  stories: [],
  page: 1,
  fetchStories: async () => {
    const response = await fetch(`https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty&page=${page}`);
    set((state) => ({ stories: [...state.stories, ...response.data] }));
  },
}));

export default useStore;
```

## Styling

TailwindCSS is used for styling, making the app responsive and ensuring a clean design without needing to write custom CSS. The global SCSS file handles a few overrides and additional custom styles.

## Contributing

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Commit your changes (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature-branch`).
5. Open a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
