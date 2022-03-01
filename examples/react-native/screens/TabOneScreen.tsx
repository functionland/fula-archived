import React, {useContext, useEffect, useRef, useState} from 'react';
import {Platform, StyleSheet, Image} from 'react-native';
import {TextInput, Button} from 'react-native';
import {View} from '../components/Themed';
import {RootTabScreenProps} from '../types';
import {BorgContext} from '@functionland/rn-fula';
import * as ImagePicker from 'expo-image-picker';

interface Meta {
    id: string
    type: string
    func: string
    args: Array<string>
    message: string
    status: string
    file: null | FileMeta
}

// declare Type
interface FileMeta {
    'lastModified': number
    'name': string
    'size': number
    'type': string
    'binary': string | ArrayBuffer | null
}

export default function TabOneScreen({navigation}: RootTabScreenProps<'TabOne'>) {
    const [serverId, setServerId] = useState('12D3KooWGwcKB18qSsq3AxPw9nUfpEMyePAiA1q8gqq92yuWEKKt')
    const [fileId, setFileId] = useState('QmYLgtbQ4je2PVzxFFg2zeEPjv5z1LxFXZ5g6D4X3j1erq')
    const [output, setOutput] = useState('')
    const [image, setImage] = useState(null);
    const fula = useContext(BorgContext)
    const onSubmit = async (e: any) => {
        try {
            // @ts-ignore
            await fula.start()
            // @ts-ignore
            await fula.connect(serverId)
        } catch (e) {
            console.log(e)
        }

    }

    const onSend = async (e: any) => {
        try {
            //@ts-ignore
            setFileId(await fula.sendFile(image.uri))
            console.log("asdasdasd")
            console.log(fileId)
        } catch (ee) {
            console.log(ee)
        }
    }

    const onReceiveFile = async (e: any) => {
        try {
            console.log("reseived called")
            //@ts-ignore
            const file = await fula.receiveFile(fileId)
            // console.log(await blobToBase64(file))
            console.log(file)
            setImage({uri:file})
            console.log("reseived returned")
        } catch (ee) {
            console.log(ee)
        }
    }

    const onReceiveMeta = async (e: any) => {
        try {
            //@ts-ignore
            setOutput(await fula.receiveMeta(fileId))
        } catch (ee) {
            console.log(ee)
        }
    }


    useEffect(() => {
        (async () => {
            if (Platform.OS !== 'web') {
                const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== 'granted') {
                    alert('Sorry, we need camera roll permissions to make this work!');
                }
            }
        })();
    }, []);


    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        console.log(result);

        if (!result.cancelled) {
            // @ts-ignore
            setImage({uri:result.uri});
        }
    };

    return (


        <View style={styles.container}>
            <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                <Button title="Pick an image from camera roll" onPress={pickImage}/>
                {image && <Image source={image} style={{width: 200, height: 200}}/>}
            </View>
            <View style={styles.textAreaContainer}>
                <TextInput
                    style={styles.textArea}
                    underlineColorAndroid="transparent"
                    placeholder="Type something"
                    placeholderTextColor="grey"
                    numberOfLines={10}
                    multiline={true}
                    defaultValue={output}
                    onChangeText={(text) => setOutput(text)}
                />
            </View>
            <TextInput
                defaultValue={serverId}
                onChangeText={(text) => setServerId(text)}
            />
            <TextInput
                defaultValue={fileId}
                onChangeText={(text) => setFileId(text)}
            />

            <Button title="Connect" onPress={onSubmit}/>
            <Button title="Select" onPress={onSubmit}/>
            <Button title="Send" onPress={onSend}/>
            <Button title="Receive" onPress={onReceiveFile}/>
            <Button title="Receive Meta" onPress={onReceiveMeta}/>
        </View>


    );
}

function blobToBase64(blob) {
    return new Promise((resolve, _) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
    });
}


const styles = StyleSheet.create({
    textAreaContainer: {
        borderColor: "white",
        borderWidth: 1,
        padding: 5
    },
    textArea: {
        height: 150,
        justifyContent: "flex-start"
    },
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    separator: {
        marginVertical: 30,
        height: 1,
        width: '80%',
    },
    video: {
        marginTop: 20,
        maxHeight: 400,
        width: 400,
        flex: 1
    }
});
