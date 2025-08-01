import { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Map from "@/components/JobMap"

export default function FormHandler() {
  const [jobTitle, setJobTitle] = useState('');
  const [loading, setLoading] = useState(false);

  // reloading element every time
  const [seed, setSeed] = useState(1); 
  // allowing clickable functions upon first submission only
  const [pressed, setPressed] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      // sends request to update geojson data
      await fetch('/api/update-geodata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobTitle }),
      });

      setPressed(true); // responsible for flagging that button was pressed for the first time
      await setSeed(Math.random()); // response for reloading elem each time
      
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 rounded-lg justify-items-center w-full">
        <div className="justify-items-center mb-5 py-2">
          <h2 className="scroll-m-20 pb-2 text-7xl font-semibold tracking-tight first:mt-0">
              get employed
          </h2>
          <form onSubmit={handleSubmit} className="inline-flex mt-4 p-3">
              <Input 
              type="text" 
              name="jobTitle"
              autoFocus
              onChange={(e) => setJobTitle(e.target.value)}
              value={jobTitle}
              className='w-100'
              placeholder='Search using a job title...'
              />
              <Button type="submit" className="ml-2 w-30">{loading ? 'Searching...' : 'Submit'}</Button>
          </form>
        </div>

        <Map isSubmitted={pressed} key={seed}/>
    </div>
  );
}
