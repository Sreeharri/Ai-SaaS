import React, { use, useEffect } from 'react'
import {useAuth, useUser} from '@clerk/clerk-react'
import { dummyPublishedCreationData } from '../assets/assets';
import { Heart } from 'lucide-react';
import axios from 'axios'
import toast from 'react-hot-toast';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const Community = () => {

  const [creations, setCreations] = React.useState([]);
  const {  user} = useUser()
  const [loading, setLoading] = React.useState(true);

     const { getToken } = useAuth();

  const fetchCreations = async () => {
    try {
      const {data} = await axios.get('/api/user/get-published-creations', {
        headers: {
          Authorization: `Bearer ${await getToken()}`
        }
      });

      if (data.success) {
        setCreations(data.creations);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
    setLoading(false);
  }

  const imageLikeToggle = async (Id) => {
    try {
      const {data} = await axios.post('/api/user/toggle-like-creation', {
        headers: {
          Authorization: `Bearer ${await getToken()}`
        }
      });

      if (data.success) {
       toast.success(data.message);
       await fetchCreations(); 
      } else {
       toast.error(data.message);
      }

    } catch (error) {
      toast.error(error.message);
    }
  }

  

useEffect(() => {
  if (user) {
    fetchCreations();
  }
}, [user]);

  return !loading ? (
    <div className='flex-1 h-full flex flex-col gap-4 p-4'>
      Creations
      <div className='bg-white h-full w-full rounded-xl overflow-y-scroll'>
      {creations.map((creations, index) => (
        <div key={index} className='relative group inline-block pl-3 pt-3 w-full sm:max-w-1/2 lg:max-w1/3'>
          <img src={creations.content} alt="" className='w-full h-full object-cover rounded-lg' />

          <div className='absolute bottom-0 left-3 right-0 top-0 flex gap-2 items-end justify-end group-hover:justify-between p-3 group-hover:bg-gradient-to-b from-transparent to-black/80 text-white rounded-lg'>

            <p className='text-sm hidden group-hover:block'>{creations.prompt}</p>
            <div className='flex gap-1 items-center '>
              <p>{creations.likes.length}</p>
              <Heart onClick={() => imageLikeToggle(creations.id)} className={`min-w-5 h-5 hover:scale-110 cursor-pointer ${creations.likes.includes(user.id) ? 'fill-red-500 text-red-600' : 'text-white'}`}></Heart>
            </div>
          </div>

        </div>

      ))}

      </div>
    </div>
  ) : (
    <div className='flex-1 h-full flex items-center justify-center'>
      <span className='w-10 h-10 my-1 rounded-full border-3 border-primary border-t-transparent animate-spin'></span>
    </div>
  )
}

export default Community
