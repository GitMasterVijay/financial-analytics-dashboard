import { Box, Container, Paper, Typography } from '@mui/material';

function Transactions() {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Transactions
        </Typography>
        <Paper sx={{ p: 4 }}>
          <Typography variant="body1" color="text.secondary">
            Transactions content will be implemented in a later step.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}

export default Transactions;
