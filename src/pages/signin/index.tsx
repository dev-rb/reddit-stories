import { ActionIcon, Anchor, Button, createStyles, Group, PasswordInput, Stack, Text, TextInput, Title } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useRouter } from 'next/router';
import * as React from 'react';
import { BsGoogle, BsReddit } from 'react-icons/bs';
import { MdKeyboardBackspace } from 'react-icons/md';

const useStyles = createStyles((theme, { largeScreen }: { largeScreen: boolean }) => ({
    container: {
        width: largeScreen ? '40vw' : '100%',
    },
    divider: {
        width: '35%',
        borderTop: `2px solid ${theme.colors.dark[5]}`
    }
}));

const SignIn = () => {

    const router = useRouter();

    const largeScreen = useMediaQuery('(min-width: 900px)');

    const { classes } = useStyles({ largeScreen });

    return (
        <Stack spacing={0} align='center'>
            <Stack spacing={0} p='lg' className={classes.container}>
                <ActionIcon size='xl'>
                    <MdKeyboardBackspace size={50} onClick={() => { router.back() }} />
                </ActionIcon>

                <Stack spacing={'sm'} py={40}>
                    <Title> SIGN IN </Title>
                    <Text> Sign in to access your saved prompts, stories, and likes. </Text>
                </Stack>

                <Stack>
                    <TextInput type='email' label='Email Address' placeholder='Your Email' required />
                    <PasswordInput label='Password' placeholder='Your Password' required />
                    <Group position='right' sx={{ width: '100%' }}>
                        <Anchor> Forgot Password? </Anchor>
                    </Group>

                    <Button mt={'xl'} sx={{ height: '40px' }}> Sign In </Button>
                </Stack>

                <Stack mt={100} align='center' sx={{ width: '100%' }}>
                    <Group noWrap spacing={'md'} align='center' position='center' sx={{ width: '100%' }}>
                        <div className={classes.divider} />
                        <Text> or Sign In with </Text>
                        <div className={classes.divider} />
                    </Group>

                    <Group noWrap sx={{ width: '100%' }}>
                        <Button variant='outline' fullWidth leftIcon={<BsGoogle />}> Google </Button>
                        <Button variant='outline' fullWidth leftIcon={<BsReddit />}> Reddit </Button>
                    </Group>

                    <Text mt={50}>
                        Don't Have an Account?
                        <Anchor> Sign Up </Anchor>
                    </Text>
                </Stack>

            </Stack>
        </Stack >
    );
}

export default SignIn;