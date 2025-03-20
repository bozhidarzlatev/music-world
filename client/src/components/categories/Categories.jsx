import { Link } from 'react-router';

const categories = [
  {
    name: 'Albums',
    catImg: 'https://www.rollingstone.com/wp-content/uploads/2019/12/RS-BestAlbumofDecade.jpg?w=1581&h=1054&crop=1',
    id: '2d5ae478-87c7-45fa-acf9-f04aa4724421',
  },
  {
    name: 'Instruments',
    catImg: 'https://www.creativefabrica.com/wp-content/uploads/2023/04/21/Set-of-musical-instruments-Graphics-67774669-1.jpg',
    id: '6012c542-38e1-4660-ba40-1b109c40cb2f',
  },
  {
    name: 'Events',
    catImg: 'https://www.eventsindustryforum.co.uk/images/articles/about_the_eif.jpg',
    id: 'd749a819-1e41-4c65-9ce2-7b429c4ebd0d',
  },
  {
    name: 'Merch',
    catImg: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqHMmfmKGXbbI83n6cUUzvr-GmCfSQVsJZEg&s',
    id: 'd749a819-1e41-4c65-9ce2-7b429casd45d',
  },
];

export default function Categories () {
  return (
    <div className="h-screen flex justify-center items-center bg-gray-100">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
        {categories.map((category) => (
          <div
            key={category.id}
            className="flex flex-col items-center space-y-4 justify-center"
          >
            <div className="relative w-40 h-40 aspect-w-1 aspect-h-1 rounded-full overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
              <img
                src={category.catImg}
                alt={category.name}
                className="w-full h-full object-cover transform transition-transform duration-300 hover:scale-110"
              />
              <Link
                to={`/categories/${category.name.toLowerCase()}`}
                className="absolute inset-0 flex justify-center items-center bg-white bg-opacity-30 text-black font-black text-3xl opacity-0 hover:opacity-80 transition-opacity duration-300"
              >
                Explore
              </Link>
            </div>
            <h2 className="text-xl font-semibold text-center">{category.name}</h2>
          </div>
        ))}
      </div>
    </div>
  );

};

