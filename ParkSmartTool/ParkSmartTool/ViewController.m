//
//  ViewController.m
//  ParkSmartTool
//
//  Created by Cef Ramirez on 11/11/15.
//  Copyright © 2015 CMU. All rights reserved.
//

#import "ViewController.h"

#import "GatewaySettingsViewController.h"

@interface ViewController ()

@property (nonatomic, weak) IBOutlet UITextField *hostField;
@property (nonatomic, weak) IBOutlet UITextField *portField;

- (IBAction)connect:(id)sender;

@property (nonatomic, strong) NSString *server;
@property (nonatomic, assign) NSInteger port;
@property (nonatomic, strong) NSDictionary *settings;

@end

@implementation ViewController

- (void)connect:(id)sender
{
    // validate fields
    NSString *host = self.hostField.text;
    NSString *port = self.portField.text;
    
    if(host.length == 0 || port.length == 0){
        [self displayError:@"Host and Port must be valid"];
        return;
    }
    
    NSInteger thePort = [port integerValue];
    if(thePort < 0 || thePort > 65535){
        [self displayError:@"Port must be valid"];
        return;
    }
    
    [self connectToServer:host withPort:thePort];
}

- (void)connectToServer:(NSString *)server withPort:(NSInteger)port
{
    // try to ping server, if its valid, then we can connect to it
    NSString *urlString = [NSString stringWithFormat:@"http://%@:%ld/api/v1/settings", server, port];
    [[[NSURLSession sharedSession] dataTaskWithURL:[NSURL URLWithString:urlString]
                                completionHandler:^(NSData * _Nullable data, NSURLResponse * _Nullable response, NSError * _Nullable error) {
                                    
                                    NSHTTPURLResponse *httpResponse = (NSHTTPURLResponse *)response;
                                    
                                    dispatch_async(dispatch_get_main_queue(), ^{
                                        if(httpResponse.statusCode == 200){
                                            NSDictionary *settings = [NSJSONSerialization JSONObjectWithData:data options:0 error:nil];
                                            [self configureServer:server withPort:port andSettings:settings];
                                        } else {
                                            [self displayError:@"Cannot connect to gateway"];
                                        }
                                    });
                                }] resume];
}

- (void)configureServer:(NSString *)server withPort:(NSInteger)port andSettings:(NSDictionary *)settings
{
    NSLog(@"settings: %@", settings);
    self.server = server;
    self.port = port;
    self.settings = settings;
    [self performSegueWithIdentifier:@"configure"
                              sender:self];
}

- (void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender
{
    UIViewController *aVC = [segue destinationViewController];
    if([aVC isKindOfClass:[GatewaySettingsViewController class]]){
        GatewaySettingsViewController *vc = (GatewaySettingsViewController *)aVC;
        vc.server = self.server;
        vc.port = self.port;
        vc.settings = self.settings;
    }
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

@end
