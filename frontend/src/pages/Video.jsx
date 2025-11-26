// /frontend/src/components/Video.js

import React, { useEffect, useRef } from 'react';

const Video = ({ peer }) => {
    const ref = useRef();

    useEffect(() => {
        // When a peer connects, we get a 'stream' event
        peer.on("stream", stream => {
            if (ref.current) {
                ref.current.srcObject = stream;
            }
        });

        // Cleanup function for when the component unmounts
        return () => {
            if (peer) {
                peer.off("stream");
            }
        };
    }, [peer]);

    return (
        <video
            playsInline
            autoPlay
            ref={ref}
            className="w-full h-full object-cover rounded-lg"
        />
    );
}

export default Video;