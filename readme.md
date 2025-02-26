# Invoice Pro


A modern, professional, client-side invoice generator that works entirely in your browser. Create, customize, and print professional invoices without sending your data to any server or requiring any backend connections.

## 🌟 Features

- **Professional Design**: Clean, modern interface with customizable styling
- **Full Invoice Management**: Create and manage invoices with multiple service line items
- **Time Tracking**: Add and track service hours with different categories
- **Financial Tools**: Calculate subtotals, taxes, and discounts automatically
- **Multiple Export Options**: Print directly or export to PDF
- **Data Security**: All data stays in your browser (stored in localStorage)
- **Customization**: Change colors, fonts, and theme modes (light/dark)
- **Validation**: Smart form validation with interactive error correction
- **Responsive**: Works on desktop and mobile devices
- **No Dependencies**: Zero external libraries or frameworks required

## 📋 Installation

### Option 1: Direct Download

1. Download the three files: `invoice.html`, `invoice.css`, and `invoice.js`
2. Save all three files in the same directory
3. Open `invoice.html` in any modern web browser

### Option 2: Clone Repository

```bash
git clone https://github.com/yourusername/invoice-pro.git
cd invoice-pro
# Simply open invoice.html in your browser
```

## 🚀 Usage

### Creating Your First Invoice

1. Open `invoice.html` in your browser
2. Fill in your business information at the top
3. Enter client details
4. Add service items using the "Add Service" button
5. Confirm each service by clicking the checkmark or confirm all with the "Confirm Services" button
6. Set your hourly rate, tax rate, and any discounts
7. Add any notes for your client
8. Save, print, or export to PDF

### Tips for Best Results

- Complete all required fields (marked with *)
- Confirm all services before printing or exporting
- For PDF export, use the "Save as PDF" option in your browser's print dialog
- Customize the appearance with the "Customize Style" button

## 💾 Storage & Data

All data is saved to your browser's localStorage. This means:

- Your data never leaves your computer
- No internet connection is required after initial load
- Data persists between sessions until you clear it
- Each device/browser has its own separate data store

To clear all saved data, use the "Clear Invoice" button.

## 📄 File Structure

- **invoice.html**: The main HTML structure
- **invoice.css**: All styling and print formatting
- **invoice.js**: All application logic and functionality

## 🔧 Customization

### Styling

The styling system uses CSS variables for easy customization:

1. Click the "Customize Style" button
2. Adjust primary, secondary, and accent colors
3. Choose from several font families
4. Toggle between light and dark modes
5. Apply changes to see the results immediately

### Advanced Customization

For more advanced customization, you can directly edit:

- **invoice.css**: Modify styles, layouts, and print formatting
- **invoice.html**: Change structure, add fields, or modify sections
- **invoice.js**: Adjust functionality, validation rules, or calculations

## 📱 Responsive Design

The interface adapts to different screen sizes:

- **Desktop**: Full multi-column layout with side-by-side elements
- **Tablet**: Adjusted layouts with fewer columns
- **Mobile**: Single-column layout for most elements

## 🖨️ Printing & Export

### Print Output Optimization

- Clean, professional layout optimized for standard paper sizes
- Automatic reformatting for print with unnecessary elements removed
- Single-line service items for efficient space usage
- Two-column layout for invoice header preserved when printing

### PDF Export

1. Click "Export as PDF"
2. Choose page size (Letter or A4)
3. In the browser print dialog, select "Save as PDF" as destination
4. Save the file to your preferred location

## 🛠️ Technical Details

- **Browser Support**: Works on all modern browsers (Chrome, Firefox, Safari, Edge)
- **Required APIs**: localStorage, CSS Grid/Flexbox, ES6+ JavaScript
- **Printing**: Uses browser's built-in print functionality and CSS print media queries
- **Form Validation**: Custom validation with interactive error messages
- **Data Persistence**: localStorage with JSON serialization

## 🤝 Contributing

Contributions are welcome! Here's how you can contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some feature'`)
5. Push to the branch (`git push origin feature/my-feature`)
6. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.


