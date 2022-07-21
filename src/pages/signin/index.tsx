import * as React from 'react';
import { ActionIcon, Anchor, Blockquote, Button, createStyles, Group, Image, PasswordInput, Stack, Text, TextInput, Title, useMantineTheme } from '@mantine/core';
import { useColorScheme, useMediaQuery } from '@mantine/hooks';
import { useRouter } from 'next/router';
import { BsGoogle, BsReddit } from 'react-icons/bs';
import { MdKeyboardBackspace } from 'react-icons/md';
import { ClientSafeProvider, getProviders, LiteralUnion, signIn } from 'next-auth/react';
import { BuiltInProviderType } from 'next-auth/providers';

const useStyles = createStyles((theme, { largeScreen }: { largeScreen: boolean }) => ({
    mainContainer: {
        width: '100vw',
        height: '100vh'
    },
    formContainer: {
        maxWdith: largeScreen ? '50%' : '100%',
        // marginLeft: largeScreen ? '10%' : 0,

    },
    divider: {
        width: '30%',
        borderTop: `2px solid ${theme.colors.dark[5]}`
    },
    desktopBanner: {
        display: 'none',
        width: '70%',
        height: '100%',
        backgroundColor: '#F8A130',
        padding: 60,
        '& img': {
            width: '60%'
        },
        ['@media screen and (min-width: 1025px)']: {
            display: 'flex',
            '& img': {
                width: '80%'
            },
        },
        ['@media screen and (max-width: 1300px)']: {
            // width: '60%',
            padding: 20

        },
        borderTopLeftRadius: 40,
        borderBottomLeftRadius: 40
    },
    description: {
        width: '100%',
        height: 'auto',
        backgroundColor: 'white',
        borderBottomLeftRadius: 80,
        borderTopRightRadius: 80,
        // backgroundImage: 'url(/assets/description-bg.svg)',
        // backgroundPosition: 'center center',
        // backgroundSize: '100% 100%',
        // backgroundRepeat: 'no-repeat',
        ['@media screen and (max-width: 1300px)']: {
            width: '100%',
        }
    },
    descriptionDetails: {
        padding: 40,
        color: 'black',
        '.mantine-Blockquote-body': {
            color: 'black'
        },
        ['@media screen and (max-width: 1300px)']: {
            padding: 30,
            '& > div h1': {
                fontSize: '26px',
            },
            '& > div svg': {
                width: 35,
                height: 35
            }
        }
    }
}));

interface SignInProps {
    providers: Record<LiteralUnion<BuiltInProviderType, string>, ClientSafeProvider> | null
}

const SignIn = ({ providers }: SignInProps) => {

    const router = useRouter();

    const theme = useMantineTheme();

    const largeScreen = useMediaQuery('(min-width: 1000px)');

    const { classes } = useStyles({ largeScreen });

    const emailSignIn = () => {
        signIn(providers?.email.id)
    }

    const googleSignIn = () => {

    }

    const redditSignIn = () => {

    }

    return (
        <Group className={classes.mainContainer} noWrap spacing={0} align={largeScreen ? 'center' : undefined} position={largeScreen ? 'apart' : 'center'}>
            <Stack spacing={0} justify='center' align='center' sx={{ width: '100%' }}>
                <Stack spacing={0} p='lg' className={classes.formContainer}>
                    <ActionIcon size='xl'>
                        <MdKeyboardBackspace size={50} onClick={() => { router.back() }} />
                    </ActionIcon>

                    <Stack spacing={'sm'} py={40}>
                        <Title> SIGN IN </Title>
                        <Text> Sign in to access your saved prompts, stories, and likes. </Text>
                    </Stack>

                    <Stack align='center' sx={{ width: '100%' }}>
                        <TextInput
                            // variant='filled'
                            type='email'
                            label='Email Address'
                            placeholder='Your Email'
                            required sx={{ width: '100%' }}
                            description='You only need your email to sign in. A link will be sent to your email for verification.'
                        />
                        {/* <PasswordInput label='Password' placeholder='Your Password' required sx={{ width: '100%' }} />
                        <Group position='right' sx={{ width: '100%' }}> 
                            <Anchor> Forgot Password? </Anchor>
                        </Group> */}

                        <Stack sx={{ width: '100%' }}>
                            <Button mt={'xl'} sx={{ height: '40px' }} onClick={emailSignIn}> Sign In </Button>
                            <Button variant='outline' color={theme.colorScheme === 'dark' ? 'dark' : 'gray'} fullWidth leftIcon={<BsGoogle color='#3079F8' />} sx={{ color: theme.colorScheme === 'dark' ? 'white' : 'black' }}>
                                Sign in with Google
                            </Button>
                            <Button variant='outline' color={theme.colorScheme === 'dark' ? 'dark' : 'gray'} fullWidth leftIcon={<BsReddit color='#F8A130' />} sx={{ color: theme.colorScheme === 'dark' ? 'white' : 'black' }}>
                                Sign in with Reddit
                            </Button>
                        </Stack>

                        <Text mt={100}>
                            Don't Have an Account?
                            <Anchor> Sign Up </Anchor>
                        </Text>
                    </Stack>
                </Stack>
            </Stack>

            <Stack className={classes.desktopBanner} align='center' justify={'center'}>

                <img src={'/assets/Signin.svg'} />

                <Stack className={classes.description} >
                    <Stack className={classes.descriptionDetails} spacing={0} align='start' sx={{ height: '100%' }}>
                        <Group noWrap>
                            <BsReddit size={40} color='#F8A130' />
                            <Title> r/WritingPrompts </Title>
                        </Group>
                        <Blockquote sx={{ fontSize: 14 }} pl={0} styles={{ icon: { width: 14 }, }}>

                            Writing Prompts. You're a writer and you just want to flex those muscles? You've come to the right place!
                            If you see a prompt you like, simply write a short story based on it. Get comments from others, and leave commentary for other people's works.
                            Let's help each other.
                        </Blockquote>
                    </Stack>
                </Stack>

            </Stack>
        </Group >
    );
}

export default SignIn;

export async function getServerSideProps(context: any) {
    const providers = await getProviders()
    return {
        props: { providers },
    }
}