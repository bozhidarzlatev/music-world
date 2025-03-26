import { useContext } from "react"
import { useNavigate, useParams } from "react-router"
import { UserContext, useUserContext } from "../../contexts/UserContext"
import { useCreateItem } from "../../api/itemApi"

const item = {
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
        city: { render: false, type: 'city', name: 'City' },
        venue: { render: false, type: 'venue', name: 'Venue' },
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
        options: { render: false, items: [] },
        color: { render: false, type: 'text', name: 'Color' },
        imageUrl: { render: true, type: 'text', name: 'Image' },
        city: { render: false, type: 'city', name: 'City' },
        venue: { render: false, type: 'venue', name: 'Venue' },
    },
    events: {
        id: 3,
        subCategory: { render: false, type: 'option', name: 'Type' },
        subCategory2: { render: false, type: 'option', name: 'subCat2' },
        title: { render: true, type: 'text', name: 'Title' },
        genre: { render: true, type: 'text', name: 'Genre' },
        artist: { render: true, type: 'text', name: 'Artist' },
        date: { render: true, type: 'date', name: 'Date' },
        descriptions: { render: true, type: 'text', name: 'Descriptions' },
        price: { render: true, type: 'number', name: 'Price' },
        options: { render: false, items: [] },
        color: { render: false, type: 'text', name: 'Color' },
        imageUrl: { render: true, type: 'text', name: 'Image' },
        city: { render: true, type: 'city', name: 'City' },
        venue: { render: true, type: 'venue', name: 'Venue' },
    },
    merch: {
        id: 4,
        subCategory: { render: true, type: 'option', name: 'Type' },
        subCategory2: { render: false, type: 'option', name: 'subCat2' },
        title: { render: true, type: 'text', name: 'Title' },
        genre: { render: true, type: 'text', name: 'Genre' },
        artist: { render: true, type: 'text', name: 'Artist' },
        date: { render: true, type: 'date', name: 'Date' },
        descriptions: { render: true, type: 'text', name: 'Descriptions' },
        price: { render: true, type: 'number', name: 'Price' },
        options: { render: false, items: [] },
        color: { render: true, type: 'text', name: 'Color' },
        imageUrl: { render: true, type: 'text', name: 'Image' },
        city: { render: false, type: 'city', name: 'City' },
        venue: { render: false, type: 'venue', name: 'Venue' },

    },
}

export default function CreateItem() {
    const params = useParams()
    const itemsToRender = Object.entries(item[params.addCategoryId])
    const { firstName, lastName, _id } = useUserContext();
    const { create } = useCreateItem()
    const navigate = useNavigate()

    const createItemHanler = async (formData) => {

        const itemData = Object.fromEntries(formData)
        const createItemData = { ...itemData, category: params.addCategoryId, uploadedBy: `${firstName} ${lastName}` }

        await create(createItemData)

        navigate(`/categories/${params.addCategoryId}`)

    }

    return (
        <div>
            <div className="min-h-screen m-10 flex items-center justify-center  px-6">
                <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-lg">
                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Create new {params.addCategoryId}</h2>
                    <form className="space-y-5" action={createItemHanler}>
                        {itemsToRender.map(([key, value]) =>
                            value.render ?
                                value.type === 'option'
                                    ? <div key={key}>
                                        <label htmlFor={key} className="block font-medium text-gray-700">{value.name}</label>
                                        <select
                                            id={key}
                                            name={key}
                                            placeholder={`Enter ${value.name}`.toLowerCase()}
                                            className="mt-2 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        >
                                            <option defaultValue="default" key="default" disabled selected >-Please select-</option>
                                            {value.options?.map(option => (
                                                <option value={option} key={option}>{option}</option>
                                            ))
                                            }
                                           </select>
                                    </div>
                                    :
                                    <div key={key}>
                                        <label htmlFor={key} className="block font-medium text-gray-700">{value.name}</label>
                                        <input
                                            type={value.type}
                                            id={key}
                                            name={key}
                                            placeholder={`Enter ${value.name}`.toLowerCase()}
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