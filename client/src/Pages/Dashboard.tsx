import Navbar from '../Components/Navbar';
import UploadBox from '../Components/UploadBox';
import Gallery from '../Components/Gallery';
import { useState } from 'react';

export default function Dashboard() {
    const [refreshKey, setRefreshKey] = useState(0);

    const handleRefresh = () => {
        setRefreshKey(prev => prev + 1);
    };

    return (
        <div className="dashboard">
            <Navbar />
            <main className="dashboard-content">
                <div className="dashboard-header">
                    <h2>Scan Documents</h2>
                    <p>Upload images or PDFs to automatically detect and crop documents</p>
                </div>
                <UploadBox onComplete={handleRefresh} />
                <Gallery key={refreshKey} onRefresh={handleRefresh} />
            </main>
        </div>
    );
};
