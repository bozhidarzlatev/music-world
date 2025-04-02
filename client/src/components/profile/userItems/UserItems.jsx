import { useProfile } from "../../../api/profileApi"
import CatalogCard from "../../catalog/CatalogCard";

export default function UserItems() {
    const {userItems} = useProfile()
    
    return (
        <div className="min-h-screen bg-gray-100 p-8">
        
        {!userItems
            ? <h1 className="text-3xl font-bold text-center mb-8">No reviews yet</h1>
            :
            <>
            <h1 className="text-3xl font-bold text-center mb-8">Users reviews!</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">

           {userItems.map((item) =>
              <CatalogCard categoriId={item.categoriId} item={item} />
            )}

        </div>
            </>
        }

        </div>
    )
}