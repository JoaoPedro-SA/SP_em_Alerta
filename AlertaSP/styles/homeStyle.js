import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
 container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 10,
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 10,
    textAlign: "center",
  },

  highlight: {
    backgroundColor: "#111",
    borderLeftWidth: 5,
    borderRadius: 10,
    marginBottom: 15,
    overflow: "hidden",
  },

  highlightImage: {
    width: "100%",
    height: 180,
  },

  highlightTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
    padding: 10,
  },

  highlightDesc: {
    color: "#DDD",
    paddingHorizontal: 10,
    paddingBottom: 10,
  },

  card: {
    backgroundColor: "#111",
    borderLeftWidth: 5,
    borderRadius: 10,
    marginBottom: 12,
    overflow: "hidden",
  },

  image: {
    width: "100%",
    height: 140,
  },

  cardTitle: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  cardDesc: {
    color: "#CCC",
    marginTop: 5,
  },

  cardInfo: {
    color: "#888",
    marginTop: 5,
    fontSize: 12,
  },

  button: {
    backgroundColor: "#FFD700",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
});
export default styles;