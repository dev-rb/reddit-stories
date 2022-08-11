import * as React from 'react';
import { Box, Button, createStyles, Group, Stack, Text, Title } from '@mantine/core';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { showSignOutNotification } from 'src/utils/notifications';

const useStyles = createStyles((theme) => ({
    container: {
        maxWidth: '34rem',
        height: 1,
        minHeight: '10rem',
        backgroundColor: theme.colorScheme === 'dark' ? 'white' : theme.colors.dark[8],
        borderRadius: 8,

    },
    imageContainer: {
        width: '50%',
        height: '100%',
        backgroundColor: '#F8A130',
        backgroundImage: 'url(assets/signed-in.svg)',
        backgroundRepeat: 'no-repeat',
        backgroundSize: '140% 140%',
        backgroundPosition: 'center center',
        borderRadius: 8,
        display: 'none',
        ['@media screen and (min-width: 900px)']: {
            display: 'block'
        }
    },
    description: {
        width: '100%',
        height: '100%',
        padding: 12,
        ['@media screen and (min-width: 900px)']: {
            padding: '16px 20px 16px 20px'
        }
    },
    descriptionTitle: {
        color: '#F8A130',
    },
    descriptionText: {
        color: theme.colorScheme === 'dark' ? theme.colors.dark[8] : 'white',
        fontWeight: 600,
        fontSize: 14,
        ['@media screen and (min-width: 900px)']: {
            fontSize: 15
        }
    }
}));


const SignedInCard = () => {

    const { classes } = useStyles();

    const signOutUser = () => {
        signOut();
        showSignOutNotification();
    }

    return (
        <Group className={classes.container} noWrap spacing={0} mx='md' mt='sm'>
            <Box className={classes.imageContainer} />

            <Stack className={classes.description} spacing={'sm'}>
                <Stack spacing={0}>
                    <Title order={3} className={classes.descriptionTitle}> Howdy, </Title>
                    <Text className={classes.descriptionText}> Looks like you're already signed in! Head to the homepage to view prompts and stories. </Text>
                </Stack>
                <Group sx={{ marginLeft: 'auto' }}>
                    <Button variant='outline' color='dark' onClick={signOutUser}> Sign out </Button>
                    <Link href='/'>
                        <Button> Go to the homepage </Button>
                    </Link>
                </Group>
            </Stack>
        </Group>
    );
}

export default SignedInCard;