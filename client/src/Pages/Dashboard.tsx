import Navbar from '../Components/Navbar';
import UploadBox from '../Components/UploadBox';
import Gallery from '../Components/Gallery';
import { useState } from 'react';

export default function Dashboard() {
    const [refresh, setRefresh] = useState(false);

    return (
        <>
        <Navbar />
        <div className="p-6 max-w-4xl mx-auto">
            <UploadBox onComplete={() => setRefresh(!refresh)} />
            <Gallery key={String(refresh)} />
        </div>
        </>
    );
}
