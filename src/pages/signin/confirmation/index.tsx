import { Button, Group, Image, Paper, Stack, Text, Title, useMantineTheme } from '@mantine/core';
import * as React from 'react';

const ConfirmationPage = () => {

    const theme = useMantineTheme();
    // sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.4 }} 
    return (
        <Stack align='center' p='lg' sx={{ width: '100%', height: '100vh' }}>
            <Image src={'/assets/confirm-celebrate.svg'} />
            <Paper p='xl' sx={{ backgroundColor: theme.colorScheme === 'dark' ? 'white' : theme.colors.dark[8], position: 'relative', maxWidth: '30rem' }}>
                <Stack>
                    <Title order={2} sx={{ color: '#F8A130' }}> Signed in! </Title>
                    <Text color='black'> You've been signed in. You can safely close this page and return to the site/app. </Text>
                </Stack>
            </Paper>
        </Stack>
    );
}

export default ConfirmationPage;