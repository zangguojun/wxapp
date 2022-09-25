import { createElement, useState } from 'rax';
import useAsyncEffect from 'rax-use-async-effect';
import View from 'rax-view';
import Text from 'rax-text';
import styles from './index.module.css';
import Logo from '@/components/Logo';
import { hello, getOpenId } from '@/cloud/function';

export default function Home() {
  const [currentMessage, setMessage] = useState('');
  const [currentOpenId, setOpenId] = useState('');
  console.log('🚀~ 12 Home currentOpenId', currentOpenId);
  useAsyncEffect(async () => {
    console.log('🚀~ 16  i am in');
    const newMessage = await hello('Rax', 'Midway.js');
    console.log('🚀~ 16  newMessage', newMessage);
    setMessage(newMessage);

    const { openId } = await getOpenId();
    setOpenId(`${openId!.substring(0, 3)}***************${openId!.substring(14)}`);
  }, []);

  return (
    <View className={styles.homeContainer}>
      <Logo uri="//gw.alicdn.com/tfs/TB1MRC_cvb2gK0jSZK9XXaEgFXa-1701-1535.png" />
      <Text className={styles.homeTitle}>Welcome to Your Rax App</Text>
      <Text className={styles.homeInfo}>Message: {currentMessage}</Text>
      <Text className={styles.homeInfo}>OpenId: {currentOpenId}</Text>
    </View>
  );
}
