export const items = {
    albums: {
        id: 1,
        subCategory: { render: true, type: 'option', name: 'Type', options: ['CD', 'Vinyl'] },
        subCategory2: { render: false, type: 'option', name: 'subCat2' },
        title: { render: true, type: 'text', name: 'Title' },
        genre: { render: true, type: 'text', name: 'Genre' },
        artist: { render: true, type: 'text', name: 'Artist' },
        date: { render: true, type: 'date', name: 'Date' },
        descriptions: { render: true, type: 'text', name: 'Descriptions' },
        price: { render: true, type: 'number', name: 'Price' },
        color: { render: false, type: 'text', name: 'Color' },
        imageUrl: { render: true, type: 'text', name: 'Image' },
        city: { render: false, type: 'text', name: 'City' },
        venue: { render: false, type: 'text', name: 'Venue' },
        manufacturer: { render: false, type: 'text', name: 'Manufacturer' }
    },
    instruments: {
        id: 2,
        subCategory: { render: true, type: 'option', name: 'Type', options: ['String', 'Wind', 'Percussion', 'Keyboard', 'Acoustic', 'Traditional and Folk', 'Hybrid'] },
        subCategory2: { render: false, type: 'option', name: 'subCat2' },
        title: { render: true, type: 'text', name: 'Title' },
        genre: { render: false, type: 'text', name: 'Genre' },
        artist: { render: false, type: 'text', name: 'Artist' },
        date: { render: true, type: 'date', name: 'Date' },
        descriptions: { render: true, type: 'text', name: 'Descriptions' },
        price: { render: true, type: 'number', name: 'Price' },
        color: { render: false, type: 'text', name: 'Color' },
        imageUrl: { render: true, type: 'text', name: 'Image' },
        city: { render: false, type: 'text', name: 'City' },
        venue: { render: false, type: 'text', name: 'Venue' },
        manufacturer: { render: true, type: 'text', name: 'Manufacturer' }

    },
    events: {
        id: 3,
        subCategory: { render: false, type: 'option', name: 'Type'  },
        subCategory2: { render: false, type: 'option', name: 'subCat2' },
        title: { render: true, type: 'text', name: 'Title' },
        genre: { render: true, type: 'text', name: 'Genre' },
        artist: { render: true, type: 'text', name: 'Artist' },
        date: { render: true, type: 'date', name: 'Date' },
        descriptions: { render: true, type: 'text', name: 'Descriptions' },
        price: { render: true, type: 'number', name: 'Price' },
        color: { render: false, type: 'text', name: 'Color' },
        imageUrl: { render: true, type: 'text', name: 'Image' },
        city: { render: true, type: 'text', name: 'City' },
        venue: { render: true, type: 'text', name: 'Venue' },
        manufacturer: { render: false, type: 'text', name: 'Manufacturer' }

    },
    merch: {
        id: 4,
        subCategory: { render: true, type: 'option', name: 'Type', options: ['Apparel', 'Accessories', 'Drinkware', 'Fitness & Outdoor', 'Collectibles', 'Home Decor' ] },
        subCategory2: { render: false, type: 'option', name: 'subCat2' },
        title: { render: true, type: 'text', name: 'Title' },
        genre: { render: true, type: 'text', name: 'Genre' },
        artist: { render: true, type: 'text', name: 'Artist' },
        date: { render: true, type: 'date', name: 'Date' },
        descriptions: { render: true, type: 'text', name: 'Descriptions' },
        price: { render: true, type: 'number', name: 'Price' },
        color: { render: true, type: 'text', name: 'Color' },
        imageUrl: { render: true, type: 'text', name: 'Image' },
        city: { render: false, type: 'city', name: 'City' },
        venue: { render: false, type: 'venue', name: 'Venue' },
        manufacturer: { render: true, type: 'text', name: 'Manufacturer' }

    },
}