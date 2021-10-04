import { INeuralNetworkJSON, NeuralNetworkGPU } from 'brain.js';
import React, { useEffect, useState } from 'react';
import { API_URL } from './services/serverRouteConstants';

export const config = {
    binaryThresh: 0.5,
    hiddenLayers: [3], // array of ints for the sizes of the hidden layers in the network
    leakyReluAlpha: 0.01, // supported for activation type 'leaky-relu'
};

// export function predict(data: any) {
//     console.time('brain predict');
//     const predicted = net.run(data);
//     console.timeEnd('brain predict');
//     return predicted;
// }

export const Predicter = () => {
    const [pretrained, setPretrained] = useState<INeuralNetworkJSON>();
    useEffect(() => {
        async function fetchMyAPI() {
            const response = await fetch(API_URL + '/trained');
            const json = await response.json();
            setPretrained(json);
        }
        fetchMyAPI();
    }, []);

    console.log(brain);
    const [network, setNetwork] = useState<NeuralNetworkGPU>();
    useEffect(() => {
        if (!pretrained) {
            return;
        }
        const net = new brain.NeuralNetworkGPU(config);

        const networkState = pretrained;
        if (networkState) {
            console.log(networkState);
            net.fromJSON(networkState);
            setNetwork(net);
        }
    }, [pretrained]);

    const [predicted, setPredicted] = useState();

    return (
        <>
            <h3>Predicter</h3>
            <input
                type="file"
                onChange={(e) => {
                    const image = e.target.files[0];

                    return new Promise((resolve, reject) => {
                        const reader = new FileReader();

                        reader.onload = (event) => {
                            console.log(event.target.result);
                            const predicted = network?.run(event.target.result);
                            setPredicted(predicted);
                            console.log(predicted);

                            resolve(event.target.result);
                        };

                        reader.onerror = (err) => {
                            reject(err);
                        };
                        reader.readAsArrayBuffer(image);
                    });
                }}
            />

            {/* <button
                onClick=
            >
                Start
            </button> */}
            {predicted}
        </>
    );
};
