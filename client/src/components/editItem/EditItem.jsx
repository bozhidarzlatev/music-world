import { Navigate, useNavigate, useParams } from "react-router";
import { useEditItem, useItem } from "../../api/itemApi";
import useAuth from "../../hooks/useAuth";
import Spinner from "../spinner/Spinner";
import { items } from "../structure/forms";


export default function () {
    const params = useParams()
    const itemsToRender = Object.entries(items[params.categoriId])
    const itemId = params.itemId
    const { userId } = useAuth()
    const { item } = useItem(itemId)
    const { edit } = useEditItem()

    const navigate = useNavigate()

    const editItemHanlder = async (formData) => {
        const editData = Object.fromEntries(formData);
        
        const result = await edit(itemId, {...editData, category: params.categoriId});

        if (result.code === 401) {

            navigate(`/404`)
        } else {
            navigate(`/categories/${params.categoriId}/${itemId}/details`)
        }

    }


    if (!item || Object.keys(item).length === 0) {
        return <Spinner />
    }

    const isOwner = userId === item._ownerId;


    if (!isOwner) {
        return <Navigate to="/categories" />
    }

    return (
        <div>
            <div className="min-h-screen m-10 flex items-center justify-center  px-6">
                <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-lg">
                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Edit Item {params.categoriId}</h2>
                    <form className="space-y-5" action={editItemHanlder}>
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
                                            {value.options?.map(option => (
                                                option === item[key]
                                                
                                                    ? <option value={option} key={option} selected > {option}</option>
                                                    : <option value={option} key={option}>{option}</option>
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
                                            placeholder={`Enter ${value.name}`}
                                            className="mt-2 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            defaultValue={item[key]}
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