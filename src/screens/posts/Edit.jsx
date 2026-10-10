//import component React Native
import {
  View,
  Text,
  TextInput,
  Button,
  ToastAndroid,
  TouchableOpacity,
} from 'react-native';

//import hook useState & useEffect
import React, {useState, useEffect} from 'react';

//import react native image picker
import {launchImageLibrary} from 'react-native-image-picker';

//import api
import Api from '../../services/api';

//import style
import styles from '../../styles';

//import handler error
import {handleErrors} from '../../utils/handleErrors';

export default function PostEdit({route, navigation}) {
  //get ID
  const {id} = route.params;

  //init state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);

  const [errors, setErrors] = useState([]);

  //method fetchDetailPost
  const fetchDetailPost = async () => {
    await Api.get(`/api/posts/${id}`).then(response => {
      setTitle(response.data.data.title);
      setContent(response.data.data.content);
    });
  };

  //hook useEffect
  useEffect(() => {
    //call method "fetchDataPosts"
    fetchDetailPost();
  }, []);

  //method handleChoosePhoto
  const handleChoosePhoto = () => {
    launchImageLibrary({noData: true}, response => {
      if (response) {
        setImage(response);
      }
    });
  };

  //method updatePost
  const updatePost = async () => {
    //init FormData
    const formData = new FormData();

    //append data
    formData.append('title', title);
    formData.append('content', content);

    // Memeriksa apakah image ada sebelum mencoba mengakses propertinya
    if (image && image.assets && image.assets[0]) {
      formData.append('image', {
        uri: image.assets[0].uri,
        type: image.assets[0].type,
        name: image.assets[0].fileName,
      });
    }

    try {
      await Api.put(`/api/posts/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }).then(() => {
        //show toast
        ToastAndroid.show('Post Updated Successfully!', ToastAndroid.LONG);

        //redirect to home
        navigation.push('PostIndex');
      });
    } catch (error) {
      handleErrors(error.response.data, setErrors);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <View style={styles.upload}>
          <Button
            title="Choose Image"
            color="gray"
            onPress={handleChoosePhoto}
          />
        </View>
        {errors?.image && <Text style={styles.error}>{errors?.image}</Text>}
        <TextInput
          style={styles.input}
          placeholder="Title"
          defaultValue={title}
          onChangeText={value => setTitle(value)}
        />
        {errors?.title && <Text style={styles.error}>{errors?.title}</Text>}
        <TextInput
          style={styles.textarea}
          placeholder="Content"
          defaultValue={content}
          onChangeText={value => setContent(value)}
        />
        {errors?.content && <Text style={styles.error}>{errors?.content}</Text>}
        <View
          style={{
            padding: 10,
          }}>
          <TouchableOpacity style={styles.button} onPress={updatePost}>
            <Text style={styles.buttonText}>UPDATE</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
