//
//  GatewaySettingsViewController.m
//  ParkSmartTool
//
//  Created by Cef Ramirez on 11/11/15.
//  Copyright © 2015 CMU. All rights reserved.
//

#import "GatewaySettingsViewController.h"

#import <MapKit/MapKit.h>
#import <CoreLocation/CoreLocation.h>

#import "SensorTableViewController.h"
#import "GatewayWifiSettingsViewController.h"

@interface GatewaySettingsViewController () <MKMapViewDelegate>

@property (nonatomic, weak) IBOutlet UITextField *nameField;
@property (nonatomic, weak) IBOutlet UITextField *cloudAddressField;
@property (nonatomic, weak) IBOutlet UITextField *cloudPortField;
@property (nonatomic, weak) IBOutlet UITextField *pollIntervaField;
@property (nonatomic, weak) IBOutlet UITextField *submissionIntervalField;
@property (nonatomic, weak) IBOutlet UILabel *latLabel;
@property (nonatomic, weak) IBOutlet UILabel *longLabel;

@property (nonatomic, weak) IBOutlet MKMapView *mapView;

- (IBAction)saveSettings:(id)sender;

@end

@implementation GatewaySettingsViewController

- (void)viewDidLoad {
    [super viewDidLoad];
}

- (void)viewDidAppear:(BOOL)animated
{
    [super viewDidAppear:animated];
    [self refreshData];
//    37.410588, -122.059528
}

- (void)refreshData
{
    self.title = self.settings[@"name"];
    self.nameField.text = self.settings[@"name"];
    self.cloudAddressField.text = self.settings[@"cloud_server_address"];
    self.cloudPortField.text = [self.settings[@"cloud_server_port"] isKindOfClass:[NSNumber class]] ? [self.settings[@"cloud_server_port"] stringValue] : @"0";
    self.pollIntervaField.text = [self.settings[@"poll_interval"] stringValue];
    self.submissionIntervalField.text = [self.settings[@"submission_interval"] stringValue];
//    self.latLabel.text = [self.settings[@"locLat"] stringValue];
//    self.longLabel.text = [self.settings[@"locLong"] stringValue];
    self.latLabel.text = [NSString stringWithFormat:@"%@", self.settings[@"locLat"]];
    self.longLabel.text = [NSString stringWithFormat:@"%@", self.settings[@"locLong"]];
}

- (IBAction)saveSettings:(id)sender
{
    NSMutableDictionary *settings = [NSMutableDictionary new];
    
    settings[@"name"] = self.nameField.text;
    settings[@"cloud_server_address"] = self.cloudAddressField.text;
    settings[@"cloud_server_port"] = [NSNumber numberWithInteger:[self.cloudPortField.text integerValue]];
    settings[@"poll_interval"] = [NSNumber numberWithInteger:[self.pollIntervaField.text integerValue]];
    settings[@"submission_interval"] = [NSNumber numberWithInteger:[self.submissionIntervalField.text integerValue]];
    settings[@"locLat"] = [NSNumber numberWithFloat:self.mapView.userLocation.location.coordinate.latitude];
    settings[@"locLong"] = [NSNumber numberWithFloat:self.mapView.userLocation.location.coordinate.longitude];
    
    [self saveToServer:settings];
}

- (void)saveToServer:(NSDictionary *)settings
{
    // try to ping server, if its valid, then we can connect to it
    NSString *urlString = [NSString stringWithFormat:@"http://%@:%ld/api/v1/settings", self.server, self.port];
    
    NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:[NSURL URLWithString:urlString]];
    request.HTTPMethod = @"POST";
    [request addValue:@"application/json" forHTTPHeaderField:@"Content-Type"];
    request.HTTPBody = [NSJSONSerialization dataWithJSONObject:settings options:0 error:nil];
    
    [[[NSURLSession sharedSession] dataTaskWithRequest:request
                                    completionHandler:^(NSData * _Nullable data, NSURLResponse * _Nullable response, NSError * _Nullable error) {
                                        NSHTTPURLResponse *httpResponse = (NSHTTPURLResponse *)response;
                                        dispatch_async(dispatch_get_main_queue(), ^{
                                            if(httpResponse.statusCode == 200){
                                                NSDictionary *theSettings = [NSJSONSerialization JSONObjectWithData:data options:0 error:nil];
                                                NSLog(@"new settings: %@", theSettings);
                                                self.settings = theSettings;
                                                [self refreshData];
                                            } else {
                                                [self displayError:@"Failed to save settings"];
                                            }
                                        });
                                    }] resume];
}

- (void)mapView:(MKMapView *)mapView didUpdateUserLocation:(MKUserLocation *)userLocation
{
    MKMapCamera *camera = [MKMapCamera cameraLookingAtCenterCoordinate:userLocation.location.coordinate
                                                     fromEyeCoordinate:userLocation.location.coordinate
                                                           eyeAltitude:100];
    [self.mapView setCamera:camera animated:YES];
}

- (void)displayError:(NSString *)error
{
    UIAlertController *alert = [UIAlertController alertControllerWithTitle:@"Error"
                                                                   message:error
                                                            preferredStyle:UIAlertControllerStyleAlert];
    [alert addAction:[UIAlertAction actionWithTitle:@"OK"
                                              style:UIAlertActionStyleCancel
                                            handler:nil]];
    [self presentViewController:alert animated:YES completion:nil];
}

- (void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender
{
    UIViewController *aVC = [segue destinationViewController];
    if([aVC isKindOfClass:[SensorTableViewController class]]){
        SensorTableViewController *vc = (SensorTableViewController *)aVC;
        vc.server = self.server;
        vc.port = self.port;
    } else if([aVC isKindOfClass:[GatewayWifiSettingsViewController class]]){
        GatewayWifiSettingsViewController *vc = (GatewayWifiSettingsViewController *)aVC;
        vc.server = self.server;
        vc.port = self.port;
    }
}

@end
