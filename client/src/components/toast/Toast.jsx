export default function Toast({message}){
    return (
        <div
        className={`z-100 fixed top-25 right-50 px-6 py-3 rounded-lg shadow-lg text-white 
        ${message.code === 200 ? "bg-green-400" : "bg-red-400"}`}
      >
        {message.message}
      </div>
    )
}