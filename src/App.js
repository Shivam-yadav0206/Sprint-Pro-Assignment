import React, { useEffect, useState } from "react";
import "./App.css";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import {
  List,
  ListItem,
  ListItemText,
  Typography,
  Container,
  Grid,
  Paper,
  CircularProgress,
  IconButton,
  AppBar,
  Toolbar,
} from "@mui/material";
import { Favorite, FavoriteBorder, Delete } from "@mui/icons-material";

function App() {
  const [date, setDate] = useState(null);
  const [birthdays, setBirthdays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [favoriteBirthdays, setFavoriteBirthdays] = useState(() => {
    const savedFavorites = localStorage.getItem("favoriteBirthdays");
    return savedFavorites ? JSON.parse(savedFavorites) : [];
  });

  useEffect(() => {
    const fetchBirthdays = async (selectedDate) => {
      if (selectedDate) {
        setLoading(true);
        const month = selectedDate.format("MM");
        const day = selectedDate.format("DD");
        try {
          const res = await fetch(
            `https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/births/${month}/${day}`
          );
          const data = await res.json();
          setBirthdays(data.births || []);
        } catch (error) {
          console.error("Failed to fetch birthdays", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchBirthdays(date);
  }, [date]);

  const toggleFavorite = (birthday) => {
    setFavoriteBirthdays((prevFavorites) => {
      const isFavorite = prevFavorites.some(
        (fav) => fav.text === birthday.text && fav.year === birthday.year
      );
      let updatedFavorites;
      if (isFavorite) {
        updatedFavorites = prevFavorites.filter(
          (fav) => fav.text !== birthday.text || fav.year !== birthday.year
        );
      } else {
        updatedFavorites = [...prevFavorites, birthday];
      }
      localStorage.setItem(
        "favoriteBirthdays",
        JSON.stringify(updatedFavorites)
      );
      return updatedFavorites;
    });
  };

  const removeFavorite = (birthday) => {
    setFavoriteBirthdays((prevFavorites) => {
      const updatedFavorites = prevFavorites.filter(
        (fav) => fav.text !== birthday.text || fav.year !== birthday.year
      );
      localStorage.setItem(
        "favoriteBirthdays",
        JSON.stringify(updatedFavorites)
      );
      return updatedFavorites;
    });
  };

  const isFavorite = (birthday) => {
    return favoriteBirthdays.some(
      (fav) => fav.text === birthday.text && fav.year === birthday.year
    );
  };

  return (
    <div
      className="App"
      style={{ backgroundColor: "#a8b8d7", minHeight: "100vh" }}>
      <AppBar position="fixed" sx={{ backgroundColor: "#8423df" }}>
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, fontFamily: "BlinkMacSystemFont" }}>
            Birthday Tracker
          </Typography>
        </Toolbar>
      </AppBar>

      <Toolbar />
      <Container style={{ padding: "20px" }}>
        <Grid
          container
          spacing={2}
          alignItems="flex-start"
          justifyContent="center">
          <Grid item xs={12} md={4}>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DemoContainer components={["DatePicker"]}>
                  <DatePicker
                    label="Select date"
                    value={date}
                    onChange={(newDate) => setDate(newDate)}
                  />
                </DemoContainer>
              </LocalizationProvider>
            </div>
            {favoriteBirthdays.length > 0 ? (
              <>
                <Typography
                  variant="h5"
                  gutterBottom
                  style={{
                    color: "black",
                    marginTop: "20px",
                    textAlign: "center",
                    fontFamily: "BlinkMacSystemFont",
                  }}>
                  Favorite Birthdays
                </Typography>
                <Paper
                  style={{ maxHeight: 400, overflow: "auto", padding: 16 }}>
                  <List>
                    {favoriteBirthdays.map((birth, index) => (
                      <ListItem
                        key={index}
                        secondaryAction={
                          <IconButton
                            edge="end"
                            onClick={() => removeFavorite(birth)}>
                            <Delete />
                          </IconButton>
                        }>
                        <ListItemText
                          primary={birth.text}
                          secondary={birth.year}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </>
            ) : null}
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography
              variant="h5"
              gutterBottom
              style={{ color: "black", fontFamily: "BlinkMacSystemFont" }}>
              {date ? `Birthdays on ${date.format("MMMM D")}` : "Pick A Date"}
            </Typography>
            {date && (
              <Paper style={{ maxHeight: 485, overflow: "auto", padding: 16 }}>
                {loading ? (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "100%",
                    }}>
                    <CircularProgress />
                  </div>
                ) : (
                  <List>
                    {birthdays.map((birth, index) => (
                      <ListItem
                        key={index}
                        secondaryAction={
                          <IconButton
                            edge="end"
                            onClick={() => toggleFavorite(birth)}>
                            {isFavorite(birth) ? (
                              <Favorite />
                            ) : (
                              <FavoriteBorder />
                            )}
                          </IconButton>
                        }>
                        <ListItemText
                          primary={birth.text}
                          secondary={birth.year}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Paper>
            )}
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}

export default App;
