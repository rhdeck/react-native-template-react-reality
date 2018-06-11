import React, { Component, Children } from "react";
import {
  AppRegistry,
  View,
  Text,
  processColor,
  NativeModules,
  TextInput,
  Button,
  Image
} from "react-native";
import {
  ARTouchableMonoView,
  ARPlane,
  ARNode,
  ARBox,
  ARMaterial,
  ARMaterials,
  ARMaterialProperty,
  ARText,
  ARDualView,
  ARSphere,
  ARSKScene,
  ARSKLabel,
  ARPrimeBaseNode,
  ARMonoView,
  ARSessionProvider,
  ARAnimatedProvider,
  ARTrackingConsumer,
  ARTrackingProvider,
  ARPositionProvider,
  ARScene,
  ARModel,
  ARShape
} from "react-reality";
import * as RNFS from "react-native-fs";
import { unzip } from "react-native-zip-archive";

const getImage = async (sourceFile, URL) => {
  const path = RNFS.DocumentDirectoryPath + "/" + sourceFile;
  if (await RNFS.exists(path)) {
    return path;
  }
  const { promise, jobId } = RNFS.downloadFile({ fromUrl: URL, toFile: path });
  await promise;
  return path;
};

const getFolder = async (sourcePath, URL) => {
  const path = RNFS.DocumentDirectoryPath + "/" + sourcePath;
  if (await RNFS.exists(path)) {
    return path;
  }
  const zipPath = path + ".zip";
  const { promise, jobId } = RNFS.downloadFile({
    fromUrl: URL,
    toFile: zipPath
  });
  await RNFS.mkdir(path);
  await promise;
  await unzip(zipPath, path);
  const files = await RNFS.readDir(path);
  console.log("Got files from ", zipPath, files);
  return path;
};

class artestObjects extends Component {
  state = {
    showPreview: true,
    fatColor: "blue",
    tallColor: "purple",
    text: "Hi",
    isEditing: false,
    zpos: -5,
    delta: 0.5,
    duration: 200,
    durationDelta: 100,
    sphereProps: {
      color: processColor("red")
    }
  };

  componentDidMount() {
    (async () => {
      const path = await getImage(
        "hanandchewie.jpg",
        "https://assets2.ignimgs.com/2013/09/28/star-wars-chewbacca-han-solo-1280jpg-883b7a_1280w.jpg"
      );
      // const path = await getImage(
      //   "earth.jpg",
      //   "https://sos.noaa.gov/ftp_mirror/land/blue_marble/earth_vegetation/4096.jpg"
      // );
      this.setState({ sphereProps: { path } });
    })();
    const to = () => {
      setTimeout(() => {
        this.setState(({ zpos, delta, duration, durationDelta }) => {
          if (zpos > 2) delta = -1 * Math.abs(delta);
          if (zpos < -2) delta = Math.abs(delta);
          console.log("I started with", duration, durationDelta);
          if (duration < 1000) durationDelta = Math.abs(durationDelta);
          if (duration > 3000) durationDelta = -1 * Math.abs(durationDelta);
          console.log("And I will update with ", duration, durationDelta);
          return {
            zpos: zpos + delta,
            delta,
            duration: duration + durationDelta,
            durationDelta
          };
        });
        to();
      }, this.state.duration);
    };
    to();
  }
  render() {
    return (
      <ARSessionProvider preview={true} debug>
        <View style={{ flex: 1 }}>
          <ARTouchableMonoView style={{ flex: 1 }}>
            <ARAnimatedProvider
              milliseconds={this.state.duration}
              easing="none"
              key="main"
            >
              <ARNode
                position={{ x: 0, y: -0.5, z: -1 }}
                eulerAngles={{
                  x: this.state.zpos / 2,
                  y: this.state.zpos,
                  z: 0,
                  w: 0
                }}
                scale={Math.abs(Math.pow(this.state.zpos / 10, 2)) + 0.05}
                onPressIn={() => {
                  this.setState({ fatColor: "green" });
                }}
                onPressOut={() => {
                  this.setState({ fatColor: "blue" });
                }}
              >
                <ARAnimatedProvider milliseconds={1000}>
                  <ARBox width={2} height={0.5} length={2} chamfer={0}>
                    <ARMaterials roughness={0.5} metalness={0.2}>
                      <ARMaterialProperty color={this.state.fatColor} />
                    </ARMaterials>
                  </ARBox>
                </ARAnimatedProvider>
                <ARAnimatedProvider
                  milliseconds={this.state.duration}
                  easing="out"
                >
                  <ARNode position={{ x: -1, y: this.state.zpos * 5, z: -2 }}>
                    <ARSphere radius={2}>
                      <ARMaterials>
                        <ARMaterialProperty
                          id="diffuse"
                          {...this.state.sphereProps}
                        />
                      </ARMaterials>
                    </ARSphere>
                  </ARNode>
                </ARAnimatedProvider>
                <ARNode
                  position={{ x: 0.4, y: 3, z: 0 }}
                  eulerAngles={{ x: 0.5, y: 0, z: 0 }}
                  onPress={() => {
                    this.setState(({ tallColor, delta }) => {
                      return {
                        delta: -1 * delta,
                        tallColor: tallColor == "yellow" ? "purple" : "yellow"
                      };
                    });
                  }}
                >
                  <ARBox width={0.5} height={2} length={0.5} chamfer={0}>
                    <ARMaterial index={0}>
                      <ARMaterialProperty
                        id="diffuse"
                        color={processColor(this.state.tallColor)}
                      />
                    </ARMaterial>
                    <ARMaterial index={1}>
                      <ARMaterialProperty
                        id="diffuse"
                        color={processColor(this.state.tallColor)}
                      />
                    </ARMaterial>
                    <ARMaterial index={2}>
                      <ARMaterialProperty
                        id="diffuse"
                        color={processColor("green")}
                      />
                    </ARMaterial>
                    <ARMaterial index={3}>
                      <ARMaterialProperty
                        id="diffuse"
                        color={processColor("green")}
                      />
                    </ARMaterial>
                    <ARMaterial index={4}>
                      <ARMaterialProperty
                        id="diffuse"
                        color={processColor("red")}
                      />
                    </ARMaterial>
                    <ARMaterial index={5}>
                      <ARMaterialProperty
                        id="diffuse"
                        color={processColor("red")}
                      />
                    </ARMaterial>
                  </ARBox>
                  <ARAnimatedProvider milliseconds={0}>
                    <ARNode position={{ x: 1, y: 1, z: -1 }} scale={0.05}>
                      <ARText text={this.state.text} size={0.5} depth={0.1}>
                        <ARMaterials>
                          <ARMaterialProperty
                            id="diffuse"
                            color={processColor("green")}
                          />
                        </ARMaterials>
                      </ARText>
                    </ARNode>
                  </ARAnimatedProvider>
                </ARNode>
              </ARNode>
              <ARAnimatedProvider milliseconds={0}>
                <ARNode
                  position={{ x: 0, y: -0.75, z: -2 }}
                  onPress={() => {
                    this.setState({ isEditing: true });
                  }}
                >
                  <ARPlane width={2} height={2}>
                    <ARMaterial index={0}>
                      <ARMaterialProperty id="diffuse">
                        <ARSKScene
                          width={400}
                          height={400}
                          color={processColor("yellow")}
                        >
                          <ARSKLabel
                            fontColor={processColor("purple")}
                            fontSize={100}
                            width={400}
                            text={this.state.text}
                            fontName="Arial-BoldMT"
                            position={{ x: 50, y: 50 }}
                          />
                        </ARSKScene>
                      </ARMaterialProperty>
                    </ARMaterial>
                  </ARPlane>
                </ARNode>
              </ARAnimatedProvider>
            </ARAnimatedProvider>
            )}
          </ARTouchableMonoView>
          {this.state.isEditing ? (
            <View position="absolute" style={{ left: 50, top: 50 }}>
              <Button
                onPress={() => {
                  this.setState({ isEditing: false });
                }}
                title="End Editing"
              />
              <TextInput
                style={{
                  display: "none"
                }}
                autoFocus
                text={this.state.text}
                multiline
                onEndEditing={() => {
                  this.setState({ isEditing: false });
                }}
                onChangeText={text => {
                  this.setState({ text });
                }}
                onBlur={() => {
                  this.setState({ isEditing: false });
                }}
              />
            </View>
          ) : null}
        </View>
      </ARSessionProvider>
    );
  }
}
class artestPlanes extends Component {
  state = {
    sceneColor: {}
  };
  render() {
    return (
      <ARSessionProvider preview={true} debug>
        <ARTrackingProvider planeDetection>
          <ARTouchableMonoView style={{ flex: 1 }}>
            <ARTrackingConsumer>
              {({ anchors }) => {
                var out = [];
                if (anchors) {
                  Object.keys(anchors).forEach(k => {
                    const v = anchors[k];
                    console.log("Anchor info:", k, v, this.state.sceneColor);
                    if (!k) return;
                    if (!v || !v.plane) return;
                    out.push(
                      <ARNode
                        key={k}
                        parentNode={k}
                        eulerAngles={{ x: (-1 * Math.PI) / 2, y: 0, z: 0 }}
                        onPress={() => {
                          console.log("Tappp");
                          this.setState(({ sceneColor }) => {
                            return {
                              sceneColor: {
                                ...sceneColor,
                                [k]:
                                  sceneColor[k] == "purple"
                                    ? "yellow"
                                    : "purple"
                              }
                            };
                          });
                        }}
                      >
                        <ARPlane width={v.plane.width} height={v.plane.height}>
                          <ARMaterial index={0}>
                            <ARMaterialProperty
                              color={processColor("green")}
                              id="diffuse"
                            >
                              <ARSKScene
                                height={400}
                                width={400}
                                color={processColor(
                                  this.state.sceneColor[k]
                                    ? this.state.sceneColor[k]
                                    : "red"
                                )}
                              >
                                <ARSKLabel
                                  text={
                                    v.plane.alignment +
                                    " " +
                                    String(v.plane.height.toFixed(2)) +
                                    " x " +
                                    String(v.plane.width.toFixed(2))
                                  }
                                  fontColor={processColor(
                                    this.state.sceneColor[k] == "yellow"
                                      ? "black"
                                      : "white"
                                  )}
                                />
                              </ARSKScene>
                            </ARMaterialProperty>
                          </ARMaterial>
                        </ARPlane>
                      </ARNode>
                    );
                  });
                }
                return out;
              }}
            </ARTrackingConsumer>
          </ARTouchableMonoView>
        </ARTrackingProvider>
      </ARSessionProvider>
    );
  }
}
class artestSelfTracking extends Component {
  state = { positions: [] };
  render() {
    return (
      <ARSessionProvider>
        <ARMonoView style={{ flex: 1 }}>
          <ARAnimatedProvider milliseconds={100}>
            <ARPositionProvider
              sensitivity={0.05}
              didPositionChange={posInfo => {
                if (!posInfo) return null;
                console.log("I am getting new position info", posInfo);
                this.setState(({ positions }) => {
                  return {
                    positions: [
                      ...positions.slice(
                        positions.length - 50,
                        positions.length
                      ),
                      posInfo.position
                    ]
                  };
                });
                console.log(
                  "Adding noes fro history",
                  this.state.positions.length
                );
              }}
            >
              {this.state.positions
                ? this.state.positions
                    .slice(0, Math.max(1, this.state.positions.length - 3))
                    .map((pos, i) => {
                      console.log(
                        "Adding node from history",
                        JSON.stringify(pos)
                      );
                      return (
                        <ARNode
                          key={i}
                          id={"motiontest-" + i.toString()}
                          position={pos}
                        >
                          <ARBox
                            height={0.01}
                            width={0.01}
                            length={0.01}
                            chamfer={0.004}
                          >
                            <ARMaterials>
                              <ARMaterialProperty
                                id="diffuse"
                                color={processColor("#0000FF")}
                              />
                            </ARMaterials>
                          </ARBox>
                        </ARNode>
                      );
                    })
                : null}
            </ARPositionProvider>
          </ARAnimatedProvider>
        </ARMonoView>
      </ARSessionProvider>
    );
  }
}
class artestImageTracking extends Component {
  state = {
    images: {}
  };
  componentDidMount() {
    (async () => {
      var out = {};
      const url2 =
        "file://" +
        (await getImage(
          "force.png",
          "https://lumiere-a.akamaihd.net/v1/images/avco_payoff_1-sht_v7_lg_32e68793.jpeg?region=118%2C252%2C1384%2C696&width=480"
        ));
      out.force = { width: 0.21, url: url2 };
      const url =
        "file://" +
        (await getImage(
          "gebn.png",
          "https://lh3.googleusercontent.com/proxy/LGEoRHj22MjuDIjiteDqsET8qKON3LBEycfPxfr62D6RStJp97Eaah1DY6h76hrsX5NU5jqmNx78OCl0PsyhCbO_BPfdXLJkWBQ"
        ));
      out.gebn = { width: 0.5, url };
      console.log("Adding images", out);
      console.log("Built out ", out); //https://lh3.googleusercontent.com/proxy/LGEoRHj22MjuDIjiteDqsET8qKON3LBEycfPxfr62D6RStJp97Eaah1DY6h76hrsX5NU5jqmNx78OCl0PsyhCbO_BPfdXLJkWBQ
      this.setState(({ images }) => {
        return { images: { ...images, ...out } };
      });
    })();
  }
  render() {
    return (
      <ARSessionProvider alignment="global">
        <ARTouchableMonoView style={{ flex: 1 }}>
          <ARAnimatedProvider milliseconds={100}>
            <ARPosition
              sensitivity={0.05}
              didPositionChange={posInfo => {
                if (!posInfo) return null;
                if (!this.state.anchorCount) return null;
                if (this.state.stopTracking) return null;
                this.setState(({ positions }) => {
                  if (!positions) positions = [];
                  return {
                    positions: [
                      ...positions.slice(
                        Math.max(0, positions.length - 50),
                        positions.length
                      ),
                      posInfo.position
                    ]
                  };
                });
              }}
            />
          </ARAnimatedProvider>
          <ARTrackingProvider
            imageDetection
            images={this.state.images}
            didUpdateAnchors={anchors => {
              this.setState({ anchorCount: Object.keys(anchors).length });
            }}
          >
            {({ anchors }) => {
              return Object.keys(anchors)
                .map(k => {
                  if (!k) return null;
                  const v = anchors[k];
                  if (!v) return null;
                  return (
                    <ARNode
                      parentNode={k}
                      id={k + "-child"}
                      key={k}
                      eulerAngles={{
                        x: (-1 * Math.PI) / 2,
                        y: 0,
                        z: 0
                      }}
                      onPress={() => {
                        console.log("ressed");
                        this.setState(({ stopTracking, positions, colors }) => {
                          if (stopTracking) {
                            positions = [];
                            colors = {};
                          }
                          return {
                            stopTracking: stopTracking ? false : true,
                            positions,
                            colors
                          };
                        });
                      }}
                    >
                      <ARNode eulerAngles={{ x: Math.PI / 2, y: 0, z: 0 }}>
                        <ARNode scale={0.4} position={{ y: 0.2, x: 0, z: 0 }}>
                          {this.state.positions
                            ? this.state.positions
                                .slice(
                                  0,
                                  Math.max(1, this.state.positions.length - 1)
                                )
                                .map((pos, i) => {
                                  return (
                                    <ARNode
                                      key={i}
                                      id={"motiontest-" + i.toString()}
                                      position={pos}
                                      onPress={() => {
                                        if (!this.state.stopTracking) return;
                                        this.setState(({ colors }) => {
                                          if (!colors) colors = {};
                                          return {
                                            colors: {
                                              ...colors,
                                              ["node-" +
                                              i.toString()]: "#FFFF00"
                                            }
                                          };
                                        });
                                        console.log();
                                      }}
                                    >
                                      <ARBox
                                        height={0.01}
                                        width={0.01}
                                        length={0.01}
                                        chamfer={0.004}
                                      >
                                        <ARMaterials>
                                          <ARMaterialProperty
                                            id="diffuse"
                                            color={processColor(
                                              this.state.colors &&
                                              this.state.colors[
                                                "node-" + i.toString()
                                              ]
                                                ? this.state.colors[
                                                    "node-" + i.toString()
                                                  ]
                                                : "#0000FF"
                                            )}
                                          />
                                        </ARMaterials>
                                      </ARBox>
                                    </ARNode>
                                  );
                                })
                            : null}
                        </ARNode>
                      </ARNode>
                      <ARPlane
                        height={v.plane.height}
                        width={v.plane.width}
                        length={0.1}
                      >
                        <ARMaterials>
                          <ARMaterialProperty
                            id="diffuse"
                            color={processColor("green")}
                          >
                            <ARSKScene
                              width={v.plane.height * 2000}
                              height={v.plane.width * 2000}
                              color={processColor("#FFFF00")}
                            >
                              <ARSKLabel
                                text={v.name}
                                fontColor={processColor("black")}
                              />
                            </ARSKScene>
                          </ARMaterialProperty>
                        </ARMaterials>
                      </ARPlane>
                    </ARNode>
                  );
                })
                .filter(v => {
                  return !!v;
                });
            }}
          </ARTrackingProvider>
        </ARTouchableMonoView>
      </ARSessionProvider>
    );
  }
}

class artestHoloKit extends Component {
  state = {
    images: {}
  };
  componentDidMount() {
    (async () => {
      var out = {};
      const url2 =
        "file://" +
        (await getImage(
          "force.png",
          "https://lumiere-a.akamaihd.net/v1/images/avco_payoff_1-sht_v7_lg_32e68793.jpeg?region=118%2C252%2C1384%2C696&width=480"
        ));
      out.force = { width: 0.21, url: url2 };
      const url =
        "file://" +
        (await getImage(
          "gebn.png",
          "https://lh3.googleusercontent.com/proxy/LGEoRHj22MjuDIjiteDqsET8qKON3LBEycfPxfr62D6RStJp97Eaah1DY6h76hrsX5NU5jqmNx78OCl0PsyhCbO_BPfdXLJkWBQ"
        ));
      out.gebn = { width: 0.5, url };
      console.log("Adding images", out);
      console.log("Built out ", out); //https://lh3.googleusercontent.com/proxy/LGEoRHj22MjuDIjiteDqsET8qKON3LBEycfPxfr62D6RStJp97Eaah1DY6h76hrsX5NU5jqmNx78OCl0PsyhCbO_BPfdXLJkWBQ
      this.setState(({ images }) => {
        return { images: { ...images, ...out } };
      });
    })();
  }
  render() {
    return (
      <ARSessionProvider alignment="global">
        <ARDualView>
          <ARAnimatedProvider milliseconds={100}>
            <ARPositionProvider
              sensitivity={0.05}
              didPositionChange={posInfo => {
                if (!posInfo) return null;
                if (!this.state.anchorCount) return null;
                if (this.state.stopTracking) return null;
                this.setState(({ positions }) => {
                  if (!positions) positions = [];
                  return {
                    positions: [
                      ...positions.slice(
                        Math.max(0, positions.length - 50),
                        positions.length
                      ),
                      posInfo.position
                    ]
                  };
                });
              }}
            />
          </ARAnimatedProvider>
          <ARTrackingProvider
            imageDetection
            images={this.state.images}
            didUpdateAnchors={anchors => {
              console.log("I found me an anchor");
              this.setState({ anchorCount: Object.keys(anchors).length });
            }}
          >
            {({ anchors }) => {
              console.log("Drawing with anchors", anchors);
              return Object.keys(anchors)
                .map(k => {
                  if (!k) return null;
                  const v = anchors[k];
                  if (!v) return null;
                  return (
                    <ARNode
                      parentNode={k}
                      id={k + "-child"}
                      key={k}
                      eulerAngles={{
                        x: (-1 * Math.PI) / 2,
                        y: 0,
                        z: 0
                      }}
                    >
                      <ARNode eulerAngles={{ x: Math.PI / 2, y: 0, z: 0 }}>
                        <ARNode scale={0.4} position={{ y: 0.2, x: 0, z: 0 }}>
                          {this.state.positions
                            ? this.state.positions
                                .slice(
                                  0,
                                  Math.max(1, this.state.positions.length - 1)
                                )
                                .map((pos, i) => {
                                  return (
                                    <ARNode
                                      key={i}
                                      id={"motiontest-" + i.toString()}
                                      position={pos}
                                      onPress={() => {
                                        if (!this.state.stopTracking) return;
                                        this.setState(({ colors }) => {
                                          if (!colors) colors = {};
                                          return {
                                            colors: {
                                              ...colors,
                                              ["node-" +
                                              i.toString()]: "#FFFF00"
                                            }
                                          };
                                        });
                                        console.log();
                                      }}
                                    >
                                      <ARBox
                                        height={0.01}
                                        width={0.01}
                                        length={0.01}
                                        chamfer={0.004}
                                      >
                                        <ARMaterials>
                                          <ARMaterialProperty
                                            id="diffuse"
                                            color={processColor(
                                              this.state.colors &&
                                              this.state.colors[
                                                "node-" + i.toString()
                                              ]
                                                ? this.state.colors[
                                                    "node-" + i.toString()
                                                  ]
                                                : "#0000FF"
                                            )}
                                          />
                                        </ARMaterials>
                                      </ARBox>
                                    </ARNode>
                                  );
                                })
                            : null}
                        </ARNode>
                      </ARNode>
                      <ARPlane
                        height={v.plane.height}
                        width={v.plane.width}
                        length={0.1}
                      >
                        <ARMaterials>
                          <ARMaterialProperty
                            id="diffuse"
                            color={processColor("green")}
                          >
                            <ARSKScene
                              width={v.plane.height * 2000}
                              height={v.plane.width * 2000}
                              color={processColor("#FFFF00")}
                            >
                              <ARSKLabel
                                text={v.name}
                                fontColor={processColor("black")}
                              />
                            </ARSKScene>
                          </ARMaterialProperty>
                        </ARMaterials>
                      </ARPlane>
                    </ARNode>
                  );
                })
                .filter(v => {
                  return !!v;
                });
            }}
          </ARTrackingProvider>
        </ARDualView>
      </ARSessionProvider>
    );
  }
}
class artestModel extends Component {
  state = { y: 0 };
  componentDidMount() {
    (async () => {
      try {
        const modelPath = await getImage(
          "shark.scn",
          "https://s3.amazonaws.com/coreml-test/shark.scn"
        );
        //this.setState({ modelPath });
        console.log("I got the model!", modelPath);
      } catch (e) {
        console.log("Error getting model", e);
      }
    })();
    (async () => {
      try {
        const polyPath = await getFolder(
          "donuts",
          "https://s3.amazonaws.com/coreml-test/donuts.zip"
        );
        console.log("I got the poly", polyPath);
        this.setState({ modelPath: polyPath + "/model.obj" });
      } catch (e) {
        console.log("Error getting the poly", e);
      }
    })();
    (async () => {
      var out = {};
      const url2 =
        "file://" +
        (await getImage(
          "force.png",
          "https://lumiere-a.akamaihd.net/v1/images/avco_payoff_1-sht_v7_lg_32e68793.jpeg?region=118%2C252%2C1384%2C696&width=480"
        ));
      out.force = { width: 0.21, url: url2 };
      const url =
        "file://" +
        (await getImage(
          "gebn.png",
          "https://lh3.googleusercontent.com/proxy/LGEoRHj22MjuDIjiteDqsET8qKON3LBEycfPxfr62D6RStJp97Eaah1DY6h76hrsX5NU5jqmNx78OCl0PsyhCbO_BPfdXLJkWBQ"
        ));
      out.gebn = { width: 0.5, url };
      console.log("Adding images", out);
      console.log("Built out ", out); //https://lh3.googleusercontent.com/proxy/LGEoRHj22MjuDIjiteDqsET8qKON3LBEycfPxfr62D6RStJp97Eaah1DY6h76hrsX5NU5jqmNx78OCl0PsyhCbO_BPfdXLJkWBQ
      this.setState(({ images }) => {
        return { images: { ...images, ...out } };
      });
    })();
    setInterval(() => {
      this.setState(({ y }) => {
        return { y: y ? y + Math.PI : Math.PI };
      });
    }, 2000);
  }
  render() {
    return (
      <ARSessionProvider>
        <View style={{ flex: 1 }}>
          <ARTouchableMonoView style={{ height: "100%", width: "100%" }}>
            {this.state.modelPath ? (
              <ARTrackingProvider
                imageDetection
                images={this.state.images}
                didUpdateAnchors={anchors => {
                  this.setState({ anchorCount: Object.keys(anchors).length });
                }}
              >
                {({ anchors }) => {
                  console.log("Rendering with anchors", anchors);
                  console.log(Object.keys(anchors));
                  if (Object.keys(anchors).length > 0) {
                    return (
                      Object.keys(anchors)
                        // .slice(0, 0)
                        .map(k => {
                          if (!k) return null;
                          const v = anchors[k];
                          if (!v) return null;
                          console.log("rendering anchor", k, v);
                          return (
                            <ARNode
                              parentNode={k}
                              id={k + "-child"}
                              key={k}
                              eulerAngles={{
                                x: 0,
                                y: 0,
                                z: 0
                              }}
                            >
                              <ARAnimatedProvider
                                milliseconds={2000}
                                easing="none"
                              >
                                <ARNode
                                  position={{ x: Math.Pi / 1000, y: 0, z: 0 }}
                                  eulerAngles={{
                                    x: 0, //Math.PI * 1.5,
                                    z: 0, //Math.PI * 2,
                                    y: 0
                                  }}
                                  // eulerAngles={{ x: -1 * Math.PI / 2, y: 0, z: 0 }}
                                  scale={this.state.y / 1000.0 + 0.001}
                                >
                                  <ARScene path={this.state.modelPath} />
                                </ARNode>
                              </ARAnimatedProvider>
                            </ARNode>
                          );
                        })
                    );
                  } else {
                    console.log("Got here");
                    return null;
                  }
                }}
              </ARTrackingProvider>
            ) : (
              <ARNode position={{ x: 0, y: 0, z: -2 }}>
                <ARPlane height={2} width={2}>
                  <ARMaterials>
                    <ARMaterialProperty id="diffuse">
                      <ARSKScene
                        color={processColor("yellow")}
                        width="200"
                        height="200"
                      >
                        <ARSKLabel text="Loading..." />
                      </ARSKScene>
                    </ARMaterialProperty>
                  </ARMaterials>
                </ARPlane>
              </ARNode>
            )}
          </ARTouchableMonoView>
        </View>
      </ARSessionProvider>
    );
  }
}

class artestShape extends Component {
  render() {
    return (
      <ARSessionProvider>
        <View style={{ flex: 1 }}>
          <ARTouchableMonoView style={{ flex: 1 }}>
            <ARNode
              position={{ x: 3, y: 0, z: -8 }}
              eulerAngles={{ x: Math.PI, y: 0, z: 0 }}
            >
              <ARBox height={1} width={1} length={1}>
                <ARMaterials>
                  <ARMaterialProperty
                    id="diffuse"
                    color={processColor("red")}
                  />
                </ARMaterials>
              </ARBox>
            </ARNode>
            <ARNode
              position={{ x: -3, y: 0, z: -8 }}
              scale={0.1}
              eulerAngles={{ x: Math.PI, y: 0, z: 0 }}
            >
              {/* <ARBox height={1} width={1} length={1} />*/}
              <ARShape
                pathSvg={`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <path d="M50,30c9-22 42-24 48,0c5,40-40,40-48,65c-8-25-54-25-48-65c 6-24 39-22 48,0 z" fill="#F00" stroke="#000"/>
    </svg>`}
                pathFlatness={0.1}
                // it's also possible to specify a chamfer profile:
                chamferRadius={5}
                chamferProfilePathSvg={`
                <svg xmlns="http://www.w3.org/2000/svg" >

    <path d="M.6 94.4c.7-7 0-13 6-18.5 1.6-1.4 5.3 1 6-.8l9.6 2.3C25 70.8 20.2 63 21 56c0-1.3 2.3-1 3.5-.7 7.6 1.4 7 15.6 14.7 13.2 1-.2 1.7-1 2-2 2-5-11.3-28.8-3-30.3 2.3-.4 5.7 1.8 6.7 0l8.4 6.5c.3-.4-8-17.3-2.4-21.6 7-5.4 14 5.3 17.7 7.8 1 .8 3 2 3.8 1 6.3-10-6-8.5-3.2-19 2-8.2 18.2-2.3 20.3-3 2.4-.6 1.7-5.6 4.2-6.4"/>
    </svg>`}
                extrusion={10}
              >
                <ARMaterials>
                  <ARMaterialProperty
                    id="diffuse"
                    color={processColor("red")}
                  />
                </ARMaterials>
              </ARShape>
            </ARNode>
          </ARTouchableMonoView>
        </View>
      </ARSessionProvider>
    );
  }
}
export default artestObjects;
