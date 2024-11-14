import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import { SafeAreaView } from "react-native-safe-area-context";
import { BinsGetApi, BinsGetItemApi } from "../constants/api";

export default function Dashboard({ onLogout, navigation }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [question, setQuestion] = useState("");
  const [bins, setBins] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchPage, setSearchPage] = useState(1);
  const [searchTotalPages, setSearchTotalPages] = useState(1);
  const [defaultBins, setDefaultBins] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchBins = async (page, isSearch = false) => {
    setIsLoading(true);
    const accessToken = await AsyncStorage.getItem("accessToken");
    const url = isSearch ? BinsGetItemApi + `${page}` : BinsGetApi + `${page}`;
    try {
      const response = await fetch(url, {
        method: isSearch ? "POST" : "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          ...(isSearch && { "Content-Type": "application/json" }),
        },
        ...(isSearch && { body: JSON.stringify({ item_name: searchQuery }) }),
      });

      const data = await response.json();
      if (response.ok) {
        setBins(data.results);
        if (isSearch) {
          setSearchTotalPages(Math.ceil(data.count / 4));
        } else {
          setTotalPages(Math.ceil(data.count / 4));
          setDefaultBins(data.results);
        }
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to fetch bins.",
        });
      }
    } catch (error) {
      console.log("Error fetching bins:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Network error. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setBins(defaultBins); // Reset bins if search query is cleared
    } else {
      fetchBins(1, true); // Call the search API with the query
    }
  }, [searchQuery]); // Trigger only when searchQuery changes

  useEffect(() => {
    if (searchQuery.trim() === "") {
      fetchBins(currentPage); // Fetch bins normally if searchQuery is empty
    }
  }, [currentPage]); // Trigger when currentPage changes

  const handleQuestionSubmit = () => {
    console.log("Question submitted:", question);
  };

  const handleLogout = () => {
    onLogout();
    navigation.navigate("Login");
  };

  const handleDashboard = () => {
    navigation.navigate("dashboard");
  };

  const handlePagination = (next = true) => {
    if (!isLoading) {
      const isSearchMode = searchQuery.trim() !== "";
      const page = isSearchMode ? searchPage : currentPage;
      const total = isSearchMode ? searchTotalPages : totalPages;

      const newPage = next ? page + 1 : page - 1;

      if (newPage >= 1 && newPage <= total) {
        if (isSearchMode) {
          setSearchPage(newPage);
          fetchBins(newPage, true);
        } else {
          setCurrentPage(newPage);
          fetchBins(newPage);
        }
      }
    }
  };

  const handleBinPress = (bin_id) => {
    navigation.navigate("BinPage", { bin_id });
  };

  const handleSearch = () => {
    if (searchQuery.trim() === "") return;
    setSearchPage(1);
    fetchBins(1, true);
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={[styles.container, { flex: 1 }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleDashboard}>
            <FontAwesome name="home" size={24} color="#0D99FF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDashboard}>
            <Text style={styles.dashboardText}>Dashboard</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleLogout}
            style={styles.logoutContainer}
          >
            <Text style={styles.logoutText}>Logout</Text>
            <FontAwesome
              name="sign-out"
              style={styles.logout}
              size={24}
              color="#0D99FF"
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Search:</Text>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Enter item to search"
            placeholderTextColor="#A9A9A9"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <FontAwesome name="search" size={24} color="black" />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Storage consultant:</Text>
        <Text style={styles.labeltext}>
          Would you like to ask a question to the storage consultant?
        </Text>

        <View style={styles.questionContainer}>
          <TextInput
            style={styles.questionInput}
            placeholder="Ask your question here"
            placeholderTextColor="#A9A9A9"
            value={question}
            onChangeText={setQuestion}
          />
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleQuestionSubmit}
          >
            <FontAwesome name="arrow-up" size={20} color="white" />
          </TouchableOpacity>
        </View>

        <Text style={styles.disclaimer}>
          Disclaimer: This will share your stored item's information with
          ChatGPT
        </Text>

        {/* Bins List */}
        <View style={styles.binsContainer}>
          {bins.length > 0 ? (
            bins.map((bin) => (
              <TouchableOpacity
                key={bin.id}
                onPress={() => handleBinPress(bin.bin_id)}
                style={styles.binItem}
              >
                <Image
                  source={{
                    uri: `data:image/jpeg;base64,${bin.bin_image_base64}`,
                  }}
                  style={styles.binImage}
                />
                <Text style={styles.binName}>{bin.bin_name}</Text>
                <Text style={styles.binLocation}>{bin.bin_location}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text>No bins available.</Text>
          )}
        </View>

        {/* Pagination */}
        <View style={styles.paginationContainer}>
          <TouchableOpacity
            onPress={() => handlePagination(false)}
            disabled={
              (searchQuery ? searchPage : currentPage) === 1 || isLoading
            }
          >
            <Text style={styles.paginationText}>Previous</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handlePagination(true)}
            disabled={
              (searchQuery ? searchPage : currentPage) ===
                (searchQuery ? searchTotalPages : totalPages) || isLoading
            }
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#0D99FF" />
            ) : (
              <Text style={styles.paginationText}>Next</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    width: "100%",
    maxWidth: 450,
    alignSelf: "center",
  },
  header: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  dashboardText: {
    marginRight: -25,
    fontSize: 20,
    fontWeight: "bold",
  },
  logoutContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoutText: {
    marginLeft: 5,
    color: "#0D99FF",
    textDecorationLine: "underline",
  },
  logout: {
    marginLeft: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  labeltext: {
    fontSize: 14,
    marginBottom: 10,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    paddingRight: 40,
    paddingLeft: 10,
  },
  searchButton: {
    position: "absolute",
    right: 10,
    top: 5,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    height: 30,
    width: 30,
  },
  questionContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  questionInput: {
    flex: 1,
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingRight: 70,
  },
  submitButton: {
    position: "absolute",
    right: 10,
    top: 5,
    backgroundColor: "#000000",
    height: 30,
    width: 30,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 15,
  },
  disclaimer: {
    fontStyle: "italic",
    marginBottom: 20,
  },
  binsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  binItem: {
    width: "48%",
    marginBottom: 20,
  },
  binImage: {
    width: "100%",
    height: 150,
    borderRadius: 5,
  },
  binName: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 5,
  },
  binLocation: {
    fontSize: 14,
    color: "gray",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  paginationButton: {
    paddingVertical: 5,
  },
  paginationText: {
    fontSize: 16,
  },
  paginationTextMiddle: {
    fontSize: 16,
    marginRight: 25,
    marginTop: 5,
  },
});
