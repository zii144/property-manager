# Text Frequency Counter

A modern, responsive web application for analyzing text frequency. Paste your text and instantly see word/item frequency analysis with beautiful visualizations.

## Features

- **Real-time Analysis**: Automatically analyzes text as you type (with debouncing)
- **Multiple Input Formats**: Supports both space-separated and line-separated text
- **Visual Frequency Bars**: Beautiful bar charts showing relative frequency
- **Statistics**: Shows total items and unique items count
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Modern UI**: Clean, modern interface with smooth animations
- **Keyboard Shortcuts**: Ctrl+Enter to quickly analyze text

## Quick Start

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone or download this project
2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Usage

1. **Paste your text** in the text area. You can use:

   - Space-separated words: `apple apple banana orange`
   - Line-separated items: Each item on a new line
   - Mixed format: Combination of spaces and line breaks

2. **View results** - The analysis appears automatically as you type, showing:

   - Each unique item and its count
   - Percentage of total items
   - Visual frequency bars
   - Total and unique item statistics

3. **Clear and start over** using the Clear button

## Example

**Input:**

```
apple
apple
apple
banana
banana
water
water
water
water
```

**Output:**

- water: 4 (40.0%)
- apple: 3 (30.0%)
- banana: 2 (20.0%)

## Technology Stack

- **HTML5**: Semantic markup with accessibility features
- **CSS3**: Modern CSS with custom properties, Grid, and Flexbox
- **JavaScript ES6+**: Modern JavaScript with classes and modules
- **Vite**: Fast build tool and development server
- **Responsive Design**: Mobile-first approach

## Project Structure

```
property-manager/
├── index.html              # Main HTML file
├── package.json            # Dependencies and scripts
├── vite.config.js          # Vite configuration
├── README.md              # This file
└── src/
    ├── js/
    │   └── main.js        # Main JavaScript application
    └── styles/
        └── main.css       # Main stylesheet
```

## Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run serve` - Serve built files on port 3000

### Code Organization

- **Modular JavaScript**: ES6 classes and modules for maintainable code
- **CSS Architecture**: CSS custom properties for consistent theming
- **Responsive Design**: Mobile-first approach with progressive enhancement
- **Accessibility**: Semantic HTML and keyboard navigation support

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Future Enhancements

- Export results to CSV/JSON
- Word cloud visualization
- Case sensitivity options
- Custom delimiter support
- Dark mode toggle
- Save/load text sessions
