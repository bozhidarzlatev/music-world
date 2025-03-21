import { useParams } from "react-router"

const item = {
    albums: {
        id: 1,
        subCategory: { render: false, type: 'option', name: 'subCat' },
        subCategory2: { render: false, type: 'option', name: 'subCat2' },
        title: { render: true, type: 'text', name: 'title' },
        genre: { render: true, type: 'text', name: 'genre' },
        artist: { render: true, type: 'text', name: 'artist' },
        date: { render: true, type: 'date', name: 'date' },
        descriptions: { render: true, type: 'text', name: 'descriptions' },
        price: { render: true, type: 'number', name: 'price' },
        options: { render: false, items: ['cd', 'vinyl'] },
    },
    instruments: {
        id: 2,
        subCategory: { render: true, type: 'option', name: 'subCat' },
        subCategory2: { render: true, type: 'option', name: 'subCat2' },
        title: { render: true, type: 'text', name: 'title' },
        genre: { render: false, type: 'text', name: 'genre' },
        artist: { render: false, type: 'text', name: 'artist' },
        date: { render: true, type: 'date', name: 'date' },
        descriptions: { render: true, type: 'text', name: 'descriptions' },
        price: { render: true, type: 'number', name: 'price' },
        options: { render: false, items: [] },
    },
    events: {
        id: 3,
        subCategory: { render: false, type: 'option', name: 'subCat' },
        subCategory2: { render: false, type: 'option', name: 'subCat2' },
        title: { render: true, type: 'text', name: 'title' },
        genre: { render: true, type: 'text', name: 'genre' },
        artist: { render: true, type: 'text', name: 'artist' },
        date: { render: true, type: 'date', name: 'date' },
        descriptions: { render: true, type: 'text', name: 'descriptions' },
        price: { render: true, type: 'number', name: 'price' },
        options: { render: false, items: [] },
    },
    merch: {
        id: 4,
        subCategory: { render: true, type: 'option', name: 'subCat' },
        subCategory2: { render: false, type: 'option', name: 'subCat2' },
        title: { render: true, type: 'text', name: 'title' },
        genre: { render: true, type: 'text', name: 'genre' },
        artist: { render: true, type: 'text', name: 'artist' },
        date: { render: true, type: 'date', name: 'date' },
        descriptions: { render: true, type: 'text', name: 'descriptions' },
        price: { render: true, type: 'number', name: 'price' },
        options: { render: false, items: [] },

    },
}

export default function CreateItem() {
    const params = useParams()
    const itemsToRender = Object.entries(item[params.addCategoryId])

    const createItemHanler = (formData) => {
        const itemData = Object.fromEntries(formData)
        console.log(itemData);
        
    }

    return (
        <div>
            <div className="min-h-screen m-10 flex items-center justify-center  px-6">
                <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-lg">
                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Create new {params.addCategoryId}</h2>
                    <form className="space-y-5" action={createItemHanler}>
                        {itemsToRender.map(([key, value] )=> 
                           value.render ? 
                            <div key={key}>
                                <label htmlFor={key} className="block font-medium text-gray-700">{value.name}</label>
                                <input
                                    type={value.type}
                                    id={key}
                                    name={key}
                                    placeholder={`Enter ${value.name}`}
                                    className="mt-2 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                            : null
                            )}

                        <button
                            type="submit"
                            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-300"

                        >
                            Create
                        </button>
                    </form>

                </div>
            </div>
        </div>
    )
}