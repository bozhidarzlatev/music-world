import { useNavigate, useParams } from "react-router"
import {  useUserContext } from "../../contexts/UserContext"
import { useCreateItem } from "../../api/itemApi"
import { items } from "../structure/forms"
import { useToastContext } from "../../contexts/ToastContext"



export default function CreateItem() {
    const params = useParams()
    const itemsToRender = Object.entries(items[params.addCategoryId])
    const { firstName, lastName } = useUserContext();
    const { create } = useCreateItem()
    const navigate = useNavigate()
    const {addToast , showToast} = useToastContext()


    const createItemHanler = async (formData) => {

        const itemData = Object.fromEntries(formData)
        const createItemData = { ...itemData, category: params.addCategoryId, uploadedBy: `${firstName} ${lastName}` }

        try {
            const createData =  await create(createItemData)
            
            if (!!createData._id !== true) {
                addToast({ code: 403, message: createData.message });
                showToast()
                throw new Error(createData.message);
            }
            addToast({ code: 200, message: 'Item added successfully!' });
            showToast()
            navigate(`/categories/${params.addCategoryId}`)
        } catch (error) {
            console.log(error);
            
        }

    }

    return (
        <div>
            <div className="min-h-screen m-10 flex items-center justify-center   px-6">
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