import * as React from 'react';
import { ActionIcon, Anchor, Blockquote, Button, createStyles, Group, Image, PasswordInput, Stack, Text, TextInput, Title, useMantineTheme } from '@mantine/core';
import { useColorScheme, useMediaQuery } from '@mantine/hooks';
import { useRouter } from 'next/router';
import { BsGoogle, BsReddit } from 'react-icons/bs';
import { MdKeyboardBackspace } from 'react-icons/md';
import { ClientSafeProvider, getProviders, LiteralUnion, signIn } from 'next-auth/react';
import { BuiltInProviderType } from 'next-auth/providers';
import { useForm, zodResolver } from '@mantine/form';
import { z } from 'zod';
import { signUp } from 'src/utils/signup';

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

const schema = z.object({
    email: z.string().email({ message: 'Invalid email address' })
})

const SignUp = () => {

    const router = useRouter();

    const theme = useMantineTheme();

    const largeScreen = useMediaQuery('(min-width: 1000px)');

    const { classes } = useStyles({ largeScreen });

    const form = useForm({
        schema: zodResolver(schema),
        initialValues: {
            email: '',
        },
    });

    const emailSignUp = async ({ email }: { email: string }) => {
        const res = await signUp('email', { email, callbackUrl: '/', redirect: false });
        console.log(res)
        if (res?.error?.includes('Email already in use')) {
            form.setFieldError('email', 'Email already in use')
        }
    }

    const googleSignIn = () => {
        signIn('google');
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
                        <Title> SIGN UP </Title>
                        <Text> Sign up to save prompts and stories </Text>
                    </Stack>

                    <Stack align='center' sx={{ width: '100%' }}>
                        <form onSubmit={form.onSubmit((values) => emailSignUp(values))}>
                            <TextInput
                                // variant='filled'
                                type='email'
                                label='Email Address'
                                placeholder='Your Email'
                                required sx={{ width: '100%' }}
                                description='You only need your email to sign up. A link will be sent to your email for verification.'
                                {...form.getInputProps('email')}
                            />
                            {/* <PasswordInput label='Password' placeholder='Your Password' required sx={{ width: '100%' }} />
                        <Group position='right' sx={{ width: '100%' }}> 
                            <Anchor> Forgot Password? </Anchor>
                        </Group> */}
                            <Button mt={50} fullWidth sx={{ height: '40px' }} type='submit'> Sign Up </Button>
                        </form>

                        <Stack sx={{ width: '100%' }}>
                            <Button
                                variant='outline'
                                color={theme.colorScheme === 'dark' ? 'dark' : 'gray'}
                                fullWidth
                                leftIcon={<BsGoogle color='#3079F8' />}
                                sx={{ color: theme.colorScheme === 'dark' ? 'white' : 'black' }}
                                onClick={googleSignIn}
                            >
                                Sign up with Google
                            </Button>
                            <Button variant='outline' color={theme.colorScheme === 'dark' ? 'dark' : 'gray'} fullWidth leftIcon={<BsReddit color='#F8A130' />} sx={{ color: theme.colorScheme === 'dark' ? 'white' : 'black' }}>
                                Sign up with Reddit
                            </Button>
                        </Stack>

                        <Text mt={100}>
                            Already Have an Account?
                            <Anchor> Sign In </Anchor>
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

export default SignUp;